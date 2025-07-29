import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vegedex API',
      version: '1.0.0',
      description: 'API pour Vegedex, une application pour identifier et partager des informations sur les plantes.',
      contact: {
        name: 'Votre Nom',
        email: 'votre.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    // Ajout d'un composant de sécurité pour le JWT
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token', // Le nom de votre cookie d'authentification
        },
      },
    },
    security: [
        {
            cookieAuth: [],
        },
    ],
  },
  // Le chemin vers les fichiers contenant les annotations OpenAPI
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;