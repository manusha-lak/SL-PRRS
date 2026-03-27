const createSwaggerSpec = (port) => ({
  openapi: '3.0.3',
  info: {
    title: 'SL-PRRS Station Service API',
    version: '1.0.0',
    description:
      'Station directory, station validation, and nearby station lookup service for the SL-PRRS assignment.',
  },
  servers: [
    { url: `http://localhost:${port}`, description: 'Direct Station Service URL' },
    {
      url: process.env.SWAGGER_GATEWAY_URL || 'http://localhost:3000',
      description: 'API Gateway URL',
    },
  ],
  tags: [
    {
      name: 'Station Service',
      description: 'APIs for police station lookup and management',
    },
  ],
  components: {
    schemas: {
      Station: {
        type: 'object',
        properties: {
          station_id: { type: 'string', example: 'STN_COL_001' },
          name: { type: 'string', example: 'Colombo Fort Police Station' },
          district: { type: 'string', example: 'Colombo' },
          division: { type: 'string', example: 'Colombo North' },
          address: { type: 'string', example: 'York Street, Colombo 01' },
          phone: { type: 'string', example: '+94-11-2421111' },
          latitude: { type: 'number', format: 'float', example: 6.9344 },
          longitude: { type: 'number', format: 'float', example: 79.8428 },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', example: '2026-03-28 10:00:00' },
          updated_at: { type: 'string', example: '2026-03-28 10:00:00' },
        },
      },
      StationInput: {
        type: 'object',
        required: ['station_id', 'name', 'district', 'address', 'latitude', 'longitude'],
        properties: {
          station_id: { type: 'string', example: 'STN_COL_010' },
          name: { type: 'string', example: 'Slave Island Police Station' },
          district: { type: 'string', example: 'Colombo' },
          division: { type: 'string', example: 'Colombo South' },
          address: { type: 'string', example: 'Justice Akbar Mawatha, Colombo' },
          phone: { type: 'string', example: '+94-11-2439999' },
          latitude: { type: 'number', format: 'float', example: 6.9271 },
          longitude: { type: 'number', format: 'float', example: 79.8588 },
          is_active: { type: 'boolean', example: true },
        },
      },
      StationValidation: {
        type: 'object',
        properties: {
          station_id: { type: 'string', example: 'STN_COL_001' },
          exists: { type: 'boolean', example: true },
          is_active: { type: 'boolean', example: true },
          station_name: { type: 'string', example: 'Colombo Fort Police Station' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: ['lat is required', 'lng is required'],
          },
        },
      },
    },
  },
  paths: {
    '/api/stations/health': {
      get: {
        tags: ['Station Service'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Station service is healthy',
          },
        },
      },
    },
    '/api/stations': {
      get: {
        tags: ['Station Service'],
        summary: 'List stations',
        parameters: [
          {
            in: 'query',
            name: 'district',
            schema: { type: 'string' },
            description: 'Filter by district',
          },
          {
            in: 'query',
            name: 'division',
            schema: { type: 'string' },
            description: 'Filter by division',
          },
          {
            in: 'query',
            name: 'active',
            schema: { type: 'string', enum: ['true', 'false', '1', '0'] },
            description: 'Filter active or inactive stations',
          },
        ],
        responses: {
          200: {
            description: 'Stations retrieved successfully',
          },
        },
      },
      post: {
        tags: ['Station Service'],
        summary: 'Create a new station',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/StationInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Station created successfully',
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Station already exists',
          },
        },
      },
    },
    '/api/stations/nearby': {
      get: {
        tags: ['Station Service'],
        summary: 'Get nearby stations',
        parameters: [
          {
            in: 'query',
            name: 'lat',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Latitude of the incident location',
          },
          {
            in: 'query',
            name: 'lng',
            required: true,
            schema: { type: 'number', format: 'float' },
            description: 'Longitude of the incident location',
          },
          {
            in: 'query',
            name: 'radiusKm',
            schema: { type: 'number', format: 'float' },
            description: 'Optional radius filter in kilometers',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer' },
            description: 'Optional maximum number of results',
          },
          {
            in: 'query',
            name: 'district',
            schema: { type: 'string' },
            description: 'Optional district filter',
          },
        ],
        responses: {
          200: {
            description: 'Nearby stations retrieved successfully',
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/stations/{stationId}': {
      get: {
        tags: ['Station Service'],
        summary: 'Get station by station_id',
        parameters: [
          {
            in: 'path',
            name: 'stationId',
            required: true,
            schema: { type: 'string' },
            description: 'Stable station identifier',
          },
        ],
        responses: {
          200: {
            description: 'Station retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Station' },
              },
            },
          },
          404: {
            description: 'Station not found',
          },
        },
      },
      put: {
        tags: ['Station Service'],
        summary: 'Update station details',
        parameters: [
          {
            in: 'path',
            name: 'stationId',
            required: true,
            schema: { type: 'string' },
            description: 'Stable station identifier',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  district: { type: 'string' },
                  division: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Station updated successfully',
          },
          400: {
            description: 'Validation failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Station not found',
          },
        },
      },
    },
    '/api/stations/{stationId}/validate': {
      get: {
        tags: ['Station Service'],
        summary: 'Validate whether a station exists and is active',
        parameters: [
          {
            in: 'path',
            name: 'stationId',
            required: true,
            schema: { type: 'string' },
            description: 'Stable station identifier',
          },
        ],
        responses: {
          200: {
            description: 'Station validation completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StationValidation',
                },
              },
            },
          },
          404: {
            description: 'Station not found',
          },
        },
      },
    },
  },
});

module.exports = createSwaggerSpec;
