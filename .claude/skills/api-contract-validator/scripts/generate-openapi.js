/**
 * OpenAPI Specification Generator
 *
 * Generates OpenAPI spec from API routes
 */

import { writeFileSync } from 'fs';
import { Logger, handleError } from '@claude-code-toolkit/utils';

const logger = new Logger('api-contract-validator:generate');

/**
 * Generate OpenAPI specification
 * @param {Object} options - Generation options
 * @param {Array<Object>} options.routes - API routes
 * @param {string} options.outputPath - Output file path
 * @param {Object} options.info - API info
 * @returns {Promise<Object>} Generated spec
 */
export async function generateOpenApiSpec(options) {
  const { routes, outputPath, info = {} } = options;

  logger.info('Generating OpenAPI specification');

  const spec = {
    openapi: '3.0.0',
    info: {
      title: info.title || 'API Documentation',
      version: info.version || '1.0.0',
      description: info.description || 'Auto-generated API documentation'
    },
    paths: {}
  };

  // Convert routes to OpenAPI paths
  routes.forEach((route) => {
    const { path, method, summary, parameters = [], responses = {} } = route;

    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }

    spec.paths[path][method.toLowerCase()] = {
      summary,
      parameters: parameters.map((p) => ({
        name: p.name,
        in: p.in || 'query',
        required: p.required || false,
        schema: { type: p.type || 'string' }
      })),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: responses[200] || { type: 'object' }
            }
          }
        },
        ...responses
      }
    };
  });

  // Write to file
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  logger.info(`OpenAPI spec written to ${outputPath}`);

  return spec;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sampleRoutes = [
    {
      path: '/users',
      method: 'GET',
      summary: 'Get all users',
      responses: {
        200: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } }
        }
      }
    }
  ];

  generateOpenApiSpec({
    routes: sampleRoutes,
    outputPath: './openapi.json',
    info: { title: 'Sample API', version: '1.0.0' }
  })
    .then((_spec) => {
      logger.info('Spec generated successfully');
      process.exit(0);
    })
    .catch((error) => {
      const exitCode = handleError(error, logger);
      process.exit(exitCode);
    });
}
