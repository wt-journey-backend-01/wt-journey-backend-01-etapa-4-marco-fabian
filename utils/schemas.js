const { z } = require("zod");

// Schema para registro de usuário
const usuarioRegSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").trim(),
  email: z.string().email("Email deve ser válido").trim(),
  senha: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/\d/, "Senha deve conter pelo menos um número")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Senha deve conter pelo menos um caractere especial")
});

// Schema para login de usuário
const usuarioLoginSchema = z.object({
  email: z.string().email("Email deve ser válido").trim(),
  senha: z.string().min(1, "Senha é obrigatória")
});

// Schema para ID (parâmetro de rota)
const idSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID deve ser um número").transform(Number)
});

// Schema para criação de agente
const agenteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").trim(),
  dataDeIncorporacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  cargo: z.enum(["inspetor", "delegado"], {
    errorMap: () => ({ message: "Cargo deve ser 'inspetor' ou 'delegado'" })
  })
});

// Schema para criação de caso
const casoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").trim(),
  descricao: z.string().min(1, "Descrição é obrigatória").trim(),
  status: z.enum(["aberto", "solucionado"], {
    errorMap: () => ({ message: "Status deve ser 'aberto' ou 'solucionado'" })
  }),
  agente_id: z.number().int().positive("agente_id deve ser um número inteiro positivo")
});

// Schema para query parameters de agentes
const agentesQuerySchema = z.object({
  cargo: z.enum(["inspetor", "delegado"]).optional(),
  sort: z.enum(["datadeincorporacao", "-datadeincorporacao"]).optional()
});

// Schema para query parameters de casos
const casosQuerySchema = z.object({
  agente_id: z.string().regex(/^\d+$/, "agente_id deve ser um número").transform(Number).optional(),
  status: z.enum(["aberto", "solucionado"]).optional(),
  q: z.string().optional()
});

module.exports = {
  usuarioRegSchema,
  usuarioLoginSchema,
  idSchema,
  agenteSchema,
  casoSchema,
  agentesQuerySchema,
  casosQuerySchema
};
