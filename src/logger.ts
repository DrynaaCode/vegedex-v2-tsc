import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Définir les niveaux de log pour la cohérence
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Choisir le niveau de log en fonction de l'environnement
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Couleurs pour les logs en développement
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Format pour la console en développement
const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  colorize({ all: true }),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

// Format JSON pour les fichiers de log en production
const fileFormat = combine(
    timestamp(),
    json()
);

// Transports (destinations des logs)
const transports = [
  // Toujours afficher les logs dans la console
  new winston.transports.Console({
      format: consoleFormat,
  }),
  // Écrire les erreurs critiques dans un fichier error.log
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  // Écrire tous les logs (de niveau 'info' et plus bas) dans un autre fichier
  new winston.transports.File({
    filename: 'logs/all.log',
    format: fileFormat,
  }),
];

// Création de l'instance du logger
const Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default Logger;