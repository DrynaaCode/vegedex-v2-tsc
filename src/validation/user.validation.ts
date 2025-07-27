import Joi from 'joi';

export const updateMeSchema = Joi.object({
  username: Joi.string().min(3).max(32),
  email: Joi.string().email(),
  profilePicture: Joi.string().uri(),
  bio: Joi.string().max(255),
}).min(1); // Au moins 1 champ


export const settingsSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'auto'),
  notifications: Joi.boolean(),
  language: Joi.string().min(2).max(8),
  newsletter: Joi.boolean(),
  timezone: Joi.string().min(2).max(64)
}).min(1); // au moins 1 champ
