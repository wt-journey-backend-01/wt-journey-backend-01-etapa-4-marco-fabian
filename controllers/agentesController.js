const agentesRepository = require('../repositories/agentesRepository');
const casosRepository = require('../repositories/casosRepository');
const { 
  ValidationError, 
  IdNotFoundError, 
  DateValidationError, 
  CargoValidationError,
  AgenteNotFoundError 
} = require('../utils/errorHandler');
const { 
  agenteSchema, 
  agentesQuerySchema, 
  idSchema 
} = require('../utils/schemas');
const { handleCreate, handleUpdate, handlePatch, handleGetById, handleDelete } = require('../utils/controllerHelpers');

async function getAllAgentes(req, res, next) {
    try {
        const queryParse = agentesQuerySchema.safeParse(req.query);
        if (!queryParse.success) {
            const { fieldErrors } = queryParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { cargo, sort } = queryParse.data;
        
        let agentes;

        const cargoParam = cargo ? cargo.toLowerCase() : undefined;
        const sortParam = sort ? sort.toLowerCase() : undefined;

        if (cargoParam && sortParam) {
            const order = sortParam.startsWith('-') ? 'desc' : 'asc';
            agentes = await agentesRepository.findByCargoSorted(cargoParam, order);
        } else if (cargoParam) {
            agentes = await agentesRepository.findByCargo(cargoParam);
        } else if (sortParam) {
            const order = sortParam.startsWith('-') ? 'desc' : 'asc';
            agentes = await agentesRepository.findAllSorted(order);
        } else {
            agentes = await agentesRepository.findAll();
        }

        res.status(200).json(agentes);
    } catch (error) {
        next(error);
    }
}

async function getAgenteById(req, res, next) {
    try {
        await handleGetById(agentesRepository, 'Agente', req, res, next);
    } catch (error) {
        next(error);
    }
}

async function createAgente(req, res, next) {
    try {
        const bodyParse = agenteSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        const data = new Date(dados.dataDeIncorporacao);
        const hoje = new Date();
        const dataStr = data.toISOString().split('T')[0];
        const hojeStr = hoje.toISOString().split('T')[0];
        
        if (dataStr > hojeStr) {
            throw new DateValidationError({
                dataDeIncorporacao: 'A data de incorporação não pode ser no futuro'
            });
        }

        req.body = dados;
        await handleCreate(agentesRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function updateAgente(req, res, next) {
    try {
        const bodyParse = agenteSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        const data = new Date(dados.dataDeIncorporacao);
        const hoje = new Date();
        const dataStr = data.toISOString().split('T')[0];
        const hojeStr = hoje.toISOString().split('T')[0];
        
        if (dataStr > hojeStr) {
            throw new DateValidationError({
                dataDeIncorporacao: 'A data de incorporação não pode ser no futuro'
            });
        }

        req.body = dados;
        await handleUpdate(agentesRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function patchAgente(req, res, next) {
    try {
        const { id } = req.params;
        
        const dados = req.body;
        const errors = {};
        
        if (dados.dataDeIncorporacao) {
            const data = new Date(dados.dataDeIncorporacao);
            const hoje = new Date();
            const dataStr = data.toISOString().split('T')[0];
            const hojeStr = hoje.toISOString().split('T')[0];
            
            if (dataStr > hojeStr) {
                errors.dataDeIncorporacao = 'A data de incorporação não pode ser no futuro';
            }
        }
        
        if (dados.cargo) {
            const validCargos = ['inspetor', 'delegado'];
            if (!validCargos.includes(dados.cargo.toLowerCase())) {
                errors.cargo = "O campo 'cargo' deve ser 'inspetor' ou 'delegado'";
            }
        }
        
        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }

        req.body = dados;
        await handlePatch(agentesRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function deleteAgente(req, res, next) {
    try {
        await handleDelete(agentesRepository, 'Agente', req, res, next);
    } catch (error) {
        next(error);
    }
}

async function getCasosByAgente(req, res, next) {
    try {
        const { id } = req.params;
        
        const agente = await agentesRepository.findById(id);
        if (!agente) {
            throw new AgenteNotFoundError({
                agente: 'Agente não encontrado'
            });
        }
        
        const casos = await casosRepository.findByAgenteId(id);
        res.status(200).json(casos);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente,
    getCasosByAgente,
};