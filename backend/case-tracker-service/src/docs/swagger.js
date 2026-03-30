const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SL-PRRS Case Service API',
      version: '1.0.0',
      description:
        'Case Service for SL-PRRS – tracks case status and history for incident reports.',
    },
    servers: [
      {
        url: 'http://localhost:3006',
        description: 'Local Case Service',
      },
    ],
    components: {
      schemas: {
        Case: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            report_id: { type: 'string' },
            station_id: { type: 'string' },
            reference_code: { type: 'string' },
            current_status: { type: 'string', enum: ['PENDING', 'RECEIVED', 'INVESTIGATING', 'RESOLVED'] },
            officer_note: { type: 'string', nullable: true },
            updated_by: { type: 'string', nullable: true },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        CaseHistoryItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            report_id: { type: 'string' },
            station_id: { type: 'string' },
            reference_code: { type: 'string' },
            status: { type: 'string' },
            officer_note: { type: 'string', nullable: true },
            updated_by: { type: 'string', nullable: true },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        UpdateCaseStatusRequest: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'RECEIVED', 'INVESTIGATING', 'RESOLVED'],
            },
            officer_note: {
              type: 'string',
              description: 'Optional note from the officer',
            },
            updated_by: {
              type: 'string',
              description: 'Officer identifier or username',
            },
          },
          required: ['status'],
        },
      },
    },
    paths: {
      '/api/cases/{reportId}': {
        get: {
          tags: ['Cases'],
          summary: 'Get case timeline by report ID',
          parameters: [
            {
              name: 'reportId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Report ID associated with the case',
            },
          ],
          responses: {
            200: {
              description: 'Case timeline fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          case: { $ref: '#/components/schemas/Case' },
                          history: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CaseHistoryItem' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Case not found for given reportId' },
          },
        },
      },
      '/api/cases/track/{referenceCode}': {
        get: {
          tags: ['Cases'],
          summary: 'Track case by reference code',
          parameters: [
            {
              name: 'referenceCode',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Reference code returned when the report was created',
            },
          ],
          responses: {
            200: {
              description: 'Case fetched successfully by reference code',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          case: { $ref: '#/components/schemas/Case' },
                          history: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CaseHistoryItem' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Case not found for given reference code' },
          },
        },
      },
      '/api/cases/{reportId}/status': {
        put: {
          tags: ['Cases'],
          summary: 'Update case status by report ID',
          parameters: [
            {
              name: 'reportId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Report ID associated with the case',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateCaseStatusRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Case status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Case' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failed for status update' },
            404: { description: 'Case not found for given reportId' },
          },
        },
      },
      '/api/cases/station/{stationId}': {
        get: {
          tags: ['Cases'],
          summary: 'Get all cases for a station',
          parameters: [
            {
              name: 'stationId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Station ID to fetch cases for',
            },
          ],
          responses: {
            200: {
              description: 'Cases fetched successfully for station',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Case' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/cases/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check for Case Service',
          responses: {
            200: {
              description: 'Case Service is healthy',
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
