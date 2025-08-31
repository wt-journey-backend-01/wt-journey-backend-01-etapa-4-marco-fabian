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
  idSchema 
} = require('../utils/schemas');
const { handleCreate, handleUpdate, handlePatch, handleGetById, handleDelete } = require('../utils/controllerHelpers');

async function getAllCasos(req, res, next) {
    try {
        // Validar query parameters com Zod
        const queryParse = casosQuerySchema.safeParse(req.query);
        if (!queryParse.success) {
            const { fieldErrors } = queryParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { agente_id, status, q } = queryParse.data;
        
        let casos;

        if (agente_id !== undefined) {
            const parsed = Number(agente_id);
            if (!Number.isInteger(parsed) || parsed <= 0) {
                throw new ValidationError({ 
                    agente_id: 'agente_id deve ser um inteiro positivo' 
                });
            }
        }

        if (status) {
            const validStatusValues = ['aberto', 'solucionado'];
            if (!validStatusValues.includes(status.toLowerCase())) {
                throw new StatusValidationError({ 
                    status: "O campo 'status' deve ser 'aberto' ou 'solucionado'" 
                });
            }
        }

        const parsedId = agente_id !== undefined ? Number(agente_id) : undefined;
        casos = await casosRepository.findWithFilters({ agente_id: parsedId, status, q });

        res.status(200).json(casos);
    } catch (error) {
        next(error);
    }
}

function getCasoById(req, res, next) {
    try {
        // Validar ID com Zod
        const idParse = idSchema.safeParse(req.params);
        if (!idParse.success) {
            const { fieldErrors } = idParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { id } = idParse.data;
        handleGetById(casosRepository, 'Caso', req, res, next);
    } catch (error) {
        next(error);
    }
}

async function getAgenteFromCaso(req, res, next) {
    try {
        // Validar ID com Zod
        const idParse = idSchema.safeParse(req.params);
        if (!idParse.success) {
            const { fieldErrors } = idParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { id: caso_id } = idParse.data;
        
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

function createCaso(req, res, next) {
    try {
        // Validar dados com Zod
        const bodyParse = casoSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        // Normalizar status para lowercase
        if (dados.status) {
            dados.status = String(dados.status).toLowerCase();
        }

        handleCreate(casosRepository, () => {}, req, res, next);
    } catch (error) {
        next(error);
    }
}

function updateCaso(req, res, next) {
    try {
        // Validar ID com Zod
        const idParse = idSchema.safeParse(req.params);
        if (!idParse.success) {
            const { fieldErrors } = idParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        // Validar dados com Zod
        const bodyParse = casoSchema.safeParse(req.body);
        if (!bodyParse.success) {
            const { formErrors, fieldErrors } = bodyParse.error.flatten();
            throw new ValidationError({
                ...(formErrors.length ? { bodyFormat: formErrors } : {}),
                ...fieldErrors
            });
        }

        const dados = bodyParse.data;
        
        // Normalizar status para lowercase
        if (dados.status) {
            dados.status = String(dados.status).toLowerCase();
        }

        handleUpdate(casosRepository, () => {}, req, res, next);
    } catch (error) {
        next(error);
    }
}

function patchCaso(req, res, next) {
    try {
        // Validar ID com Zod
        const idParse = idSchema.safeParse(req.params);
        if (!idParse.success) {
            const { fieldErrors } = idParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { id } = idParse.data;
        
        // Validar dados parciais
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
            }
        }
        
        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }

        handlePatch(casosRepository, () => {}, req, res, next);
    } catch (error) {
        next(error);
    }
}

function deleteCaso(req, res, next) {
    try {
        // Validar ID com Zod
        const idParse = idSchema.safeParse(req.params);
        if (!idParse.success) {
            const { fieldErrors } = idParse.error.flatten();
            throw new ValidationError(fieldErrors);
        }

        const { id } = idParse.data;
        handleDelete(casosRepository, 'Caso', req, res, next);
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