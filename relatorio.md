<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para marco-fabian:

Nota final: **48.5/100**

Olá, Marco Fabian! 🎉 Primeiramente, parabéns pelo esforço e dedicação em construir essa API REST completa com autenticação, segurança e integração com PostgreSQL! Já dá para ver que você estruturou bem seu projeto, organizou controllers, repositories, middlewares e rotas de forma clara, além de implementar o hashing de senhas e JWT, o que é essencial para segurança. Isso é um ótimo sinal de que você está no caminho certo! 👏

---

## 🎯 Conquistas Bônus que você acertou e merecem destaque!

- Implementou corretamente o endpoint `/usuarios/me` para retornar os dados do usuário autenticado.
- Fez a filtragem simples de casos por status, agente e keywords (mesmo que os testes tenham falhado, o código está lá e organizado).
- Criou a busca do agente responsável pelo caso.
- Implementou corretamente o middleware de autenticação para proteger as rotas de agentes e casos.
- O JWT está sendo gerado com expiração válida e o logout funciona adequadamente.
- Validou corretamente as senhas no registro, incluindo os requisitos de complexidade.

Esses pontos são fundamentais e mostram que você entendeu bem a base da autenticação e autorização! 🌟

---

## Agora, vamos analisar os testes que falharam e entender o que pode estar acontecendo para você melhorar ainda mais. 🕵️‍♂️

---

# 1. Testes que falharam e suas possíveis causas

### Falha: `'USERS: Recebe erro 400 ao tentar criar um usuário com e-mail já em uso'`

**Análise:**

No seu `authController.js`, você verifica se o email já existe com:

```js
const usuarioExistente = await usuariosRepository.findByEmail(email);
if (usuarioExistente) {
  return res.status(400).json({
    error: 'Email já está em uso'
  });
}
```

Isso está correto e deveria funcionar. Porém, o teste falhou, o que indica que ou:

- A verificação não está sendo acionada corretamente (talvez o email não está chegando como esperado).
- Ou o banco não está aplicando a restrição de unicidade corretamente.

**Possível causa raiz:**  
Você tem uma migration que cria a tabela `usuarios` com o campo `email` único:

```js
table.string('email').unique().notNullable();
```

Então, o banco deve impedir duplicidade. O problema pode estar no teste enviando um campo extra junto com o registro, que não está sendo validado e aceito, ou o controller não está validando campos extras.

---

### Falha: `'USERS: Recebe erro 400 ao tentar criar um usuário com campo extra'`

**Análise:**

No seu `authController.register`, você não faz validação explícita para rejeitar campos extras no corpo da requisição. Você apenas verifica se `nome`, `email` e `senha` existem, mas não impede que o usuário envie, por exemplo, `{ nome, email, senha, idade }`.

Isso pode causar falha no teste, pois o requisito pede que o endpoint rejeite campos extras.

**Como corrigir:**

Você pode fazer uma validação simples para garantir que o corpo tenha **exatamente** os três campos esperados:

```js
const allowedFields = ['nome', 'email', 'senha'];
const receivedFields = Object.keys(req.body);

const extraFields = receivedFields.filter(field => !allowedFields.includes(field));
if (extraFields.length > 0) {
  return res.status(400).json({
    error: `Campo(s) extra(s) não permitido(s): ${extraFields.join(', ')}`
  });
}
```

Adicione isso no início do método `register` para garantir que o payload está correto.

---

### Falha: `'Simple Filtering: Estudante implementou endpoint de filtragem de caso por status corretamente'` e outros testes similares de filtragem e busca

**Análise:**

Apesar do código do seu `casosController.js` implementar o filtro por `status`, `agente_id` e busca por `q`, os testes bônus falharam.

Isso pode indicar que:

- A validação do parâmetro `status` está sendo feita com `status.toLowerCase()`, mas talvez o banco guarde o enum em caixa diferente ou haja algum problema na query.
- A query em `casosRepository.findWithFilters` está correta, mas pode faltar algum detalhe, como garantir que o filtro por status seja case-insensitive.
- Também pode ser que os testes esperem um comportamento mais robusto, como ignorar parâmetros inválidos ou retornar erro 400 para valores inválidos.

**Sugestão:**

No método `findWithFilters` do `casosRepository.js`:

```js
if (status) {
  query = query.where({ status: String(status).toLowerCase() });
}
```

Confirme que no banco o enum `caso_status_enum` está em lowercase (`'aberto'`, `'solucionado'`), o que parece estar correto na migration.

Também verifique se o filtro por `agente_id` e busca por `q` estão funcionando corretamente.

---

### Falha: `'Complex Filtering: Estudante implementou endpoint de filtragem de agente por data de incorporacao com sorting em ordem crescente corretamente'` e similar para ordem decrescente

**Análise:**

No seu `agentesController.js`, o método `getAllAgentes` implementa o filtro e ordenação:

```js
if (cargo && sort) {
  const order = sort.startsWith('-') ? 'desc' : 'asc';
  agentes = await agentesRepository.findByCargoSorted(cargo, order);
} else if (cargo) {
  agentes = await agentesRepository.findByCargo(cargo);
} else if (sort) {
  const order = sort.startsWith('-') ? 'desc' : 'asc';
  agentes = await agentesRepository.findAllSorted(order);
} else {
  agentes = await agentesRepository.findAll();
}
```

O problema pode estar na validação do parâmetro `sort`. Você aceita apenas `'dataDeIncorporacao'` e `'-dataDeIncorporacao'`, o que está correto.

Porém, o teste pode estar esperando que o parâmetro `sort` seja sensível a maiúsculas/minúsculas (exemplo: `'dataDeIncorporacao'` vs `'datadeincorporacao'`), ou que o filtro `cargo` seja case-insensitive.

No repositório, você faz:

```js
return db('agentes').select('*').orderBy('dataDeIncorporacao', direction);
```

e

```js
.whereRaw('LOWER(cargo) = LOWER(?)', [cargo])
```

que está correto.

**Possível causa raiz:**  
O teste pode estar enviando parâmetros com maiúsculas/minúsculas diferentes e seu código não está normalizando o `sort` para lowercase antes da verificação.

**Sugestão:**

No controller, normalize os parâmetros para lowercase antes de validar:

```js
const cargoParam = cargo ? cargo.toLowerCase() : undefined;
const sortParam = sort ? sort.toLowerCase() : undefined;
```

E valide com esses valores.

---

### Falha: `'User details: /usuarios/me retorna os dados do usuario logado e status code 200'` (Teste bônus que falhou)

**Análise:**

Você implementou o método `getProfile` no `authController.js` que busca o usuário pelo `req.user.id`. Isso está correto.

Se o teste falhou, pode ser por:

- O middleware `authMiddleware` não estar populando corretamente o `req.user`.
- O token JWT pode não conter o campo `id` esperado.
- Ou o endpoint `/usuarios/me` não estar registrado corretamente na rota `authRoutes.js`.

No seu `authRoutes.js`, você tem:

```js
router.get('/usuarios/me', authMiddleware, authController.getProfile);
```

Está correto.

No `authMiddleware.js`, você faz:

```js
req.user = decoded;
```

E no token, você inclui `id` no payload:

```js
const token = jwt.sign(
  { 
    id: usuario.id, 
    email: usuario.email,
    nome: usuario.nome
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);
```

Então tudo parece certo.

**Possível causa raiz:**  
Talvez o teste espere que o endpoint retorne alguns campos específicos, e seu retorno está diferente.

Você retorna:

```js
res.status(200).json({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  created_at: usuario.created_at,
  updated_at: usuario.updated_at
});
```

Verifique se o teste espera campos com nomes diferentes, como `createdAt` em vez de `created_at`. Atenção a isso!

---

## 2. Estrutura de Diretórios e Organização do Projeto

Sua estrutura está muito bem organizada e segue o padrão esperado. Você tem:

- `routes/` com `authRoutes.js`, `agentesRoutes.js`, `casosRoutes.js`.
- `controllers/` com `authController.js`, `agentesController.js`, `casosController.js`.
- `repositories/` com `usuariosRepository.js`, `agentesRepository.js`, `casosRepository.js`.
- `middlewares/` com `authMiddleware.js`.
- `db/` com `migrations/`, `seeds/` e `db.js`.
- Arquivos essenciais como `server.js`, `knexfile.js`, `.env` e `INSTRUCTIONS.md`.

Isso é ótimo! Continue assim! 👍

---

## 3. Pontos de melhoria e dicas práticas

### a) Validação rigorosa de campos extras no registro de usuários

Como vimos, seu endpoint de registro aceita campos extras, o que falha nos testes. Para garantir segurança e integridade dos dados, sempre valide que o corpo da requisição contenha **exatamente** os campos esperados.

Exemplo de validação para `register`:

```js
const allowedFields = ['nome', 'email', 'senha'];
const receivedFields = Object.keys(req.body);
const extraFields = receivedFields.filter(field => !allowedFields.includes(field));
if (extraFields.length > 0) {
  return res.status(400).json({
    error: `Campo(s) extra(s) não permitido(s): ${extraFields.join(', ')}`
  });
}
```

### b) Normalizar parâmetros de query para evitar erros de validação

No seu `agentesController.js` e `casosController.js`, normalize os parâmetros de query para lowercase antes de validar e usar, para evitar rejeição indevida por causa de maiúsculas/minúsculas.

Exemplo:

```js
const cargoParam = cargo ? cargo.toLowerCase() : undefined;
const sortParam = sort ? sort.toLowerCase() : undefined;
```

### c) Atenção aos nomes dos campos retornados na API

Confira se os nomes dos campos retornados na sua API batem exatamente com o que os testes esperam, especialmente para datas e campos com underscore (`created_at` vs `createdAt`).

Se necessário, faça um mapeamento antes de retornar, para evitar falhas por diferenças de nomenclatura.

---

## 4. Recursos recomendados para você aprofundar e corrigir esses pontos

- Para autenticação, JWT e bcrypt, recomendo fortemente este vídeo, feito pelos meus criadores, que explica tudo de forma clara e prática:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para entender e aplicar corretamente o Knex.js em migrations e queries, veja este guia detalhado:  
  https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s

- Para garantir que seu projeto esteja organizado com boas práticas e arquitetura MVC, confira este vídeo:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

## 5. Resumo rápido dos principais pontos a focar para melhorar

- ⚠️ **Valide e rejeite campos extras no corpo da requisição ao registrar usuário.**  
- ⚠️ **Normalize parâmetros de query (ex: `cargo`, `sort`, `status`) para lowercase antes de validar e usar.**  
- ⚠️ **Verifique os nomes dos campos retornados nas respostas JSON para que coincidam com o esperado nos testes (ex: `created_at` vs `createdAt`).**  
- ⚠️ **Revise mensagens de erro e status codes para garantir que estejam alinhados com os requisitos (ex: 400 para campo extra e email duplicado).**  
- ⚠️ **Confirme que o token JWT inclui os dados necessários e que o middleware autentica corretamente.**  
- 🛠️ Continue testando localmente usando ferramentas como Postman ou Insomnia para simular os casos de uso e validar as respostas.  

---

Marco, você está muito bem encaminhado! Seu código mostra maturidade e entendimento dos conceitos essenciais. Com esses ajustes que te mostrei, você vai destravar a maioria dos testes que falharam e seu projeto ficará ainda mais robusto e profissional. 🚀

Continue firme, revisando cada detalhe com calma, e não hesite em usar os recursos que te indiquei para aprofundar seus conhecimentos. Você está quase lá! 💪

Se precisar de mais ajuda, é só chamar.

Um abraço e sucesso no seu aprendizado! 🌟

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>