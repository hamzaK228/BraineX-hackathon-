import Joi from 'joi';

/**
 * User registration validation schema
 */
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters',
      'any.required': 'Last name is required',
    }),

  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Password confirmation is required',
  }),

  field: Joi.string().required().messages({
    'any.required': 'Field of interest is required',
  }),
});

/**
 * User login validation schema
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),

  remember: Joi.boolean().optional(),
});

/**
 * Scholarship creation validation schema
 */
export const scholarshipSchema = Joi.object({
  name: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Scholarship name must be at least 3 characters',
    'string.max': 'Scholarship name cannot exceed 200 characters',
    'any.required': 'Scholarship name is required',
  }),

  organization: Joi.string().min(2).max(200).required().messages({
    'any.required': 'Organization is required',
  }),

  amount: Joi.string().required().messages({
    'any.required': 'Scholarship amount is required',
  }),

  deadline: Joi.date().iso().min('now').required().messages({
    'date.min': 'Deadline must be in the future',
    'any.required': 'Deadline is required',
  }),

  description: Joi.string().min(50).max(5000).required().messages({
    'string.min': 'Description must be at least 50 characters',
    'string.max': 'Description cannot exceed 5000 characters',
    'any.required': 'Description is required',
  }),

  category: Joi.string()
    .valid('undergraduate', 'graduate', 'international', 'research')
    .required()
    .messages({
      'any.only': 'Invalid scholarship category',
      'any.required': 'Category is required',
    }),

  country: Joi.string().optional().allow(''),

  website: Joi.string().uri().optional().allow(''),

  status: Joi.string().valid('active', 'inactive', 'expired').default('active'),
});

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * ID parameter validation
 */
export const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID parameter',
    });
  }

  req.params.id = id;
  next();
};

/**
 * Email validation helper
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validator
 */
export const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password)
  );
};

export default {
  registerSchema,
  loginSchema,
  scholarshipSchema,
  validate,
  validateId,
  isValidEmail,
  isStrongPassword,
};
