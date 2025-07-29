import app from './app';
import mongoose from 'mongoose';
import { config } from './config';
import Logger from './logger';    

mongoose.connect(config.mongoUri) 
  .then(() => {
    Logger.info('Connecté à MongoDB');
    app.listen(config.port, () => Logger.info(`Serveur lancé sur le port ${config.port}`));
  })
  .catch((err) => {
    Logger.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  });