const agentesRepository = require('../repositories/agentesRepository');
const { createValidationError, validateDateFormat, createNotFoundError } = require('../utils/errorHandler');
const { validateAgenteData } = require('../utils/validators');
const { handleCreate, handleUpdate, handlePatch, handleGetById, handleDelete } = require('../utils/controllerHelpers');
const casosRepository = require('../repositories/casosRepository');

async function getAllAgentes(req, res, next) {
    try {
        const { cargo, sort } = req.query;
        
        const cargoParam = cargo ? cargo.toLowerCase() : undefined;
        const sortParam = sort ? sort.toLowerCase() : undefined;
        
        let agentes;

        if (cargoParam) {
            const validCargos = ['inspetor', 'delegado'];
            if (!validCargos.includes(cargoParam)) {
                throw createValidationError('Parâmetros inválidos', { 
                    cargo: "O campo 'cargo' deve ser 'inspetor' ou 'delegado'" 
                });
            }
        }

        if (sortParam) {
            const validSortFields = ['datadeincorporacao', '-datadeincorporacao'];
            if (!validSortFields.includes(sortParam)) {
                throw createValidationError('Parâmetros inválidos', { 
                    sort: "O campo 'sort' deve ser 'dataDeIncorporacao' ou '-dataDeIncorporacao'" 
                });
            }
        }

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

function getAgenteById(req, res, next) {
    const { id } = req.params;
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return next(createValidationError('Parâmetros inválidos', { id: 'id deve ser um inteiro positivo' }));
    }
    handleGetById(agentesRepository, 'Agente', req, res, next);
}

function createAgente(req, res, next) {
    const validateCreate = (dados) => {
        validateAgenteData(dados, false);
    };
    
    handleCreate(agentesRepository, validateCreate, req, res, next);
}

function updateAgente(req, res, next) {
    const { id } = req.params;
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return next(createValidationError('Parâmetros inválidos', { id: 'id deve ser um inteiro positivo' }));
    }
    handleUpdate(agentesRepository, validateAgenteData, req, res, next);
}

function patchAgente(req, res, next) {
    const { id } = req.params;
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return next(createValidationError('Parâmetros inválidos', { id: 'id deve ser um inteiro positivo' }));
    }
    const validatePatch = (dados) => {
        const errors = {};
        
        if (dados.dataDeIncorporacao) {
            const dateError = validateDateFormat(dados.dataDeIncorporacao, 'dataDeIncorporacao');
            if (dateError) {
                errors.dataDeIncorporacao = dateError;
            } else {
                const data = new Date(dados.dataDeIncorporacao);
                const hoje = new Date();
                const dataStr = data.toISOString().split('T')[0];
                const hojeStr = hoje.toISOString().split('T')[0];
                if (dataStr > hojeStr) {
                    errors.dataDeIncorporacao = 'A data de incorporação não pode ser no futuro';
                }
            }
        }
        
        const validCargos = ['inspetor', 'delegado'];
        if (dados.cargo && !validCargos.includes(dados.cargo.toLowerCase())) {
            errors.cargo = "O campo 'cargo' deve ser 'inspetor' ou 'delegado'";
        }
        
        if (Object.keys(errors).length > 0) {
            throw createValidationError('Parâmetros inválidos', errors);
        }
    };
    handlePatch(agentesRepository, validatePatch, req, res, next);
}

function deleteAgente(req, res, next) {
    const { id } = req.params;
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return next(createValidationError('Parâmetros inválidos', { id: 'id deve ser um inteiro positivo' }));
    }
    handleDelete(agentesRepository, 'Agente', req, res, next);
}

async function getCasosByAgente(req, res, next) {
    try {
        const { id } = req.params;
        const parsed = Number(id);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return next(createValidationError('Parâmetros inválidos', { id: 'id deve ser um inteiro positivo' }));
        }
        const agente = await agentesRepository.findById(parsed);
        if (!agente) {
            throw createNotFoundError('Agente não encontrado');
        }
        const casos = await casosRepository.findByAgenteId(parsed);
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