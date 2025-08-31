class APIError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidIdError extends APIError {
  constructor(errors) {
    super(400, "ID inválido", errors);
  }
}

class IdNotFoundError extends APIError {
  constructor(errors) {
    super(404, "ID inexistente", errors);
  }
}

class InvalidFormatError extends APIError {
  constructor(errors) {
    super(400, "Parâmetros inválidos", errors);
  }
}

class InvalidQueryError extends APIError {
  constructor(errors) {
    super(400, "Query inválida", errors);
  }
}

class NotFoundRouteError extends APIError {
  constructor(errors) {
    super(404, "Endpoint inexistente", errors);
  }
}

class EmailExistsError extends APIError {
  constructor(errors) {
    super(400, "Email existente", errors);
  }
}

class UserNotFoundError extends APIError {
  constructor(errors) {
    super(401, "Usuário não encontrado", errors);
  }
}

class InvalidPasswordError extends APIError {
  constructor(errors) {
    super(401, "Senha inválida", errors);
  }
}

class TokenError extends APIError {
  constructor(errors) {
    super(401, "Token inválido", errors);
  }
}

class ValidationError extends APIError {
  constructor(errors) {
    super(400, "Dados inválidos", errors);
  }
}

class RequiredFieldError extends APIError {
  constructor(errors) {
    super(400, "Campos obrigatórios", errors);
  }
}

class DateValidationError extends APIError {
  constructor(errors) {
    super(400, "Data inválida", errors);
  }
}

class CargoValidationError extends APIError {
  constructor(errors) {
    super(400, "Cargo inválido", errors);
  }
}

class StatusValidationError extends APIError {
  constructor(errors) {
    super(400, "Status inválido", errors);
  }
}

class AgenteNotFoundError extends APIError {
  constructor(errors) {
    super(404, "Agente não encontrado", errors);
  }
}

class CasoNotFoundError extends APIError {
  constructor(errors) {
    super(404, "Caso não encontrado", errors);
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.isOperational) {
    const response = {
      status: err.status,
      message: err.message
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.status).json(response);
  }

  res.status(500).json({
    status: 500,
    message: 'Erro interno do servidor'
  });
}

function createValidationError(message, errors) {
  return new ValidationError(errors);
}

function createNotFoundError(message = 'Recurso não encontrado') {
  return new IdNotFoundError({ resource: message });
}

function validateRequiredFields(data, requiredFields) {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `O campo '${field}' é obrigatório`;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
}

function validateCasoStatus(status) {
  const validStatuses = ['aberto', 'solucionado'];
  if (!validStatuses.includes(status.toLowerCase())) {
    return "O campo 'status' pode ser somente 'aberto' ou 'solucionado'";
  }
  return null;
}

function validateDateFormat(date, fieldName = 'data') {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return `Campo ${fieldName} deve seguir a formatação 'YYYY-MM-DD'`;
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return `Campo ${fieldName} deve ser uma data válida`;
  }
  
  return null;
}

function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

module.exports = {
  APIError,
  InvalidIdError,
  IdNotFoundError,
  InvalidFormatError,
  InvalidQueryError,
  NotFoundRouteError,
  EmailExistsError,
  UserNotFoundError,
  InvalidPasswordError,
  TokenError,
  ValidationError,
  RequiredFieldError,
  DateValidationError,
  CargoValidationError,
  StatusValidationError,
  AgenteNotFoundError,
  CasoNotFoundError,
  errorHandler,
  createValidationError,
  createNotFoundError,
  validateRequiredFields,
  validateCasoStatus,
  validateDateFormat,
  validateUUID
}; 