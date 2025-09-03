class APIError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class InvalidIdError extends APIError {
  constructor(errors) {
    super("ID inválido", 400, errors);
  }
}

class IdNotFoundError extends APIError {
  constructor(message = "ID inexistente", errors) {
    super(message, 404, errors);
  }
}

class InvalidFormatError extends APIError {
  constructor(errors) {
    super("Parâmetros inválidos", 400, errors);
  }
}

class InvalidQueryError extends APIError {
  constructor(errors) {
    super("Query inválida", 400, errors);
  }
}

class NotFoundRouteError extends APIError {
  constructor(errors) {
    super("Endpoint inexistente", 404, errors);
  }
}

class EmailExistsError extends APIError {
  constructor(errors) {
    super("Email já está em uso", 400, errors);
  }
}

class UserNotFoundError extends APIError {
  constructor(errors) {
    super("Usuário não encontrado", 401, errors);
  }
}

class InvalidPasswordError extends APIError {
  constructor(errors) {
    super("Senha inválida", 401, errors);
  }
}

class TokenError extends APIError {
  constructor(errors) {
    super("Token inválido", 401, errors);
  }
}

class ValidationError extends APIError {
  constructor(errors) {
    super("Dados inválidos", 400, errors);
  }
}

class RequiredFieldError extends APIError {
  constructor(errors) {
    super("Campos obrigatórios", 400, errors);
  }
}

class DateValidationError extends APIError {
  constructor(errors) {
    super("Data inválida", 400, errors);
  }
}

class CargoValidationError extends APIError {
  constructor(errors) {
    super("Cargo inválido", 400, errors);
  }
}

class StatusValidationError extends APIError {
  constructor(errors) {
    super("Status inválido", 400, errors);
  }
}

class AgenteNotFoundError extends APIError {
  constructor(errors) {
    super("Agente não encontrado", 404, errors);
  }
}

class CasoNotFoundError extends APIError {
  constructor(errors) {
    super("Caso não encontrado", 404, errors);
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.isOperational) {
    const response = {
      status: err.statusCode,
      message: err.message
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
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
  return new IdNotFoundError(message, { resource: message });
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