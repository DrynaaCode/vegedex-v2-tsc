import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(32).alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required()
});
