import * as Joi from 'joi';

/**
 * Boot-time environment contract. If any required variable is missing or malformed,
 * Nest refuses to start and prints exactly what is wrong — we fail fast and loud
 * instead of crashing later with a cryptic runtime error. (docs/00 · ADR-006)
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  MONGODB_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required()
    .messages({
      'string.pattern.base': 'MONGODB_URI must be a mongodb:// or mongodb+srv:// URI',
    }),
  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.min': 'JWT_SECRET must be at least 16 characters',
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
})
  // Hosting platforms (Vercel, etc.) inject their own env vars (AWS_*, VERCEL_*, ...)
  // alongside ours. This schema only cares about the keys above — it must not reject
  // the platform's own variables just because they aren't declared here.
  .unknown(true);
