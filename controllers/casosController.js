const casosRepository = require('../repositories/casosRepository');
const agentesRepository = require('../repositories/agentesRepository');
const { 
  ValidationError, 
  IdNotFoundError, 
  StatusValidationError, 
  AgenteNotFoundError,
  CasoNotFoundError 
} = require('../utils/errorHandler');
const { 
  casoSchema, 
  casosQuerySchema, 
  idSchema,
  casoIdSchema 
} = require('../utils/schemas');
const { handleCreate, handleUpdate, handlePatch, handleGetById, handleDelete } = require('../utils/controllerHelpers');

async function getAllCasos(req, res, next) {
    try {
        const queryParse = casosQuerySchema.safeParse(req.query);
        if (!queryParse.success) {
            const { fieldErrors } = queryParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { agente_id, status, q } = queryParse.data;
        
        let casos;

        const parsedAgenteId = agente_id ? Number(agente_id) : null;
        
        if (parsedAgenteId !== null && (!Number.isInteger(parsedAgenteId) || parsedAgenteId <= 0)) {
            throw new ValidationError({ 
                agente_id: 'agente_id deve ser um inteiro positivo' 
            });
        }

        if (status) {
            const validStatusValues = ['aberto', 'solucionado'];
            if (!validStatusValues.includes(status.toLowerCase())) {
                throw new StatusValidationError({ 
                    status: "O campo 'status' deve ser 'aberto' ou 'solucionado'" 
                });
            }
        }

        casos = await casosRepository.findWithFilters({ 
            agente_id: parsedAgenteId, 
            status, 
            q 
        });

        res.status(200).json(casos);
    } catch (error) {
        next(error);
    }
}

async function getCasoById(req, res, next) {
    try {
        await handleGetById(casosRepository, 'Caso', req, res, next);
    } catch (error) {
        next(error);
    }
}

async function getAgenteFromCaso(req, res, next) {
    try {
        const { caso_id } = req.params;

        const caso = await casosRepository.findById(caso_id);
        if (!caso) {
            throw new CasoNotFoundError({
                caso: 'Caso não encontrado'
            });
        }

        const agente = await agentesRepository.findById(caso.agente_id);
        if (!agente) {
            throw new AgenteNotFoundError({
                agente: 'Agente responsável não encontrado'
            });
        }

        res.status(200).json(agente);
    } catch (error) {
        next(error);
    }
}

async function createCaso(req, res, next) {
    try {
        const bodyParse = casoSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        if (dados.status) {
            dados.status = String(dados.status).toLowerCase();
        }

        // Verificar se agente existe antes de criar caso
        const agente = await agentesRepository.findById(dados.agente_id);
        if (!agente) {
            throw new AgenteNotFoundError({
                agente_id: `Agente com ID '${dados.agente_id}' não foi encontrado`
            });
        }

        req.body = dados;
        await handleCreate(casosRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function updateCaso(req, res, next) {
    try {
        const bodyParse = casoSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        if (dados.status) {
            dados.status = String(dados.status).toLowerCase();
        }

        // Verificar se agente existe antes de atualizar caso
        const agente = await agentesRepository.findById(dados.agente_id);
        if (!agente) {
            throw new AgenteNotFoundError({
                agente_id: `Agente com ID '${dados.agente_id}' não foi encontrado`
            });
        }

        req.body = dados;
        await handleUpdate(casosRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function patchCaso(req, res, next) {
    try {
        const { id } = req.params;
        
        const dados = req.body;
        const errors = {};
        
        if (dados.status) {
            dados.status = String(dados.status).toLowerCase();
            const validStatuses = ['aberto', 'solucionado'];
            if (!validStatuses.includes(dados.status)) {
                errors.status = "O campo 'status' pode ser somente 'aberto' ou 'solucionado'";
            }
        }
        
        if (dados.agente_id !== undefined) {
            const parsed = Number(dados.agente_id);
            if (!Number.isInteger(parsed) || parsed <= 0) {
                errors.agente_id = 'agente_id deve ser um inteiro positivo';
            } else {
                // Verificar se agente existe
                const agente = await agentesRepository.findById(parsed);
                if (!agente) {
                    errors.agente_id = `Agente com ID '${parsed}' não foi encontrado`;
                }
            }
        }
        
        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }

        req.body = dados;
        await handlePatch(casosRepository, null, req, res, next);
    } catch (error) {
        next(error);
    }
}

async function deleteCaso(req, res, next) {
    try {
        const { id } = req.params;
        await handleDelete(casosRepository, 'Caso', req, res, next);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllCasos,
    getCasoById,
    getAgenteFromCaso,
    createCaso,
    updateCaso,
    patchCaso,
    deleteCaso
}; 