import Joi from 'joi';

export const updateMeSchema = Joi.object({
  username: Joi.string().min(3).max(32),
  email: Joi.string().email(),
  profilePicture: Joi.string().uri(),
  bio: Joi.string().max(255),
}).min(1); // Au moins 1 champ
