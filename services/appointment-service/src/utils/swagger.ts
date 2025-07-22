import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import fs from 'fs';
import { version } from '../../package.json';

const isProduction = process.env.NODE_ENV === 'production';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Appointment Service API',
    version,
    description: 'API documentation for the Appointment Service',
    contact: {
      name: 'Healthcare System Team',
    },
  },
  servers: [
    {
      url: isProduction 
        ? 'https://api.healthcaresystem.com/appointment-service'
        : `http://localhost:${process.env.PORT || 3001}`,
      description: isProduction ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../models/*.ts'),
    path.join(__dirname, '../models/*.js'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Function to setup swagger UI
const setupSwagger = (app: Express) => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 API Documentation available at /api-docs`);
};

export { setupSwagger };

// Function to generate swagger.json file (for API documentation)
const generateSwaggerFile = () => {
  const outputPath = path.join(__dirname, '../../swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log('Swagger JSON file has been generated at:', outputPath);
};

// Generate swagger.json file when this file is run directly
if (require.main === module) {
  generateSwaggerFile();
}
