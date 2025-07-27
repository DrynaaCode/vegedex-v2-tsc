import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(32).alphanum().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
    // Ajout du champ de confirmation
  // password_confirmation: Joi.any().equal(Joi.ref('password')).required().messages({
  //   'any.only': 'Les mots de passe ne correspondent pas.'
  // })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});