const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const supabase = require('./db/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Police Rapid Report System - Report Service API',
            version: '1.0.0',
            description: 'Microservice for handling incident reports, tracking, and station-based queries.',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local development server',
            },
        ],
    },
    apis: ['./index.js'], // Files containing annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Utility to generate the 8-character reference code (uppercase hex)
const generateRefCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Submit a new incident report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - station_id
 *               - incident_type
 *               - description
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the user submitting the report (null if anonymous).
 *               station_id:
 *                 type: integer
 *                 description: Identity of the police station receiving the report.
 *               incident_type:
 *                 type: string
 *                 description: Type of the incident (e.g., Robbery, Assault).
 *               description:
 *                 type: string
 *                 description: Detailed description of the incident.
 *               media_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of images or videos associated with the report.
 *               is_anonymous:
 *                 type: boolean
 *                 description: Whether the report should be treated as anonymous.
 *     responses:
 *       201:
 *         description: Report submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 ref_code:
 *                   type: string
 *                 report:
 *                   type: object
 *       500:
 *         description: Internal server error.
 */
app.post('/api/reports', async (req, res) => {
    try {
        const { user_id, station_id, incident_type, description, media_urls, is_anonymous } = req.body;

        // Validation (Basic)
        if (!station_id || !incident_type || !description) {
            return res.status(400).json({ error: "Missing required fields: station_id, incident_type, description" });
        }

        const refCode = generateRefCode();
        
        // PRIVACY LOGIC: Force user_id to be null if anonymous
        const finalUserId = is_anonymous ? null : user_id;

        const { data, error } = await supabase
            .from('reports')
            .insert([
                { 
                    user_id: finalUserId, 
                    ref_code: refCode, 
                    station_id, 
                    incident_type, 
                    description, 
                    media_urls: media_urls || [], 
                    is_anonymous: !!is_anonymous 
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        res.status(201).json({
            message: "Report submitted successfully",
            ref_code: refCode,
            report: data[0]
        });

    } catch (error) {
        console.error("CRITICAL ERROR: Failed to submit report:", error.message);
        res.status(500).json({ error: "Internal Server Error - Unable to process report." });
    }
});

/**
 * @swagger
 * /api/reports/station/{id}:
 *   get:
 *     summary: Fetch all reports for a specific police station (Police View)
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the station.
 *     responses:
 *       200:
 *         description: List of reports for the station.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error.
 */
app.get('/api/reports/station/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('station_id', id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        console.error("CRITICAL ERROR: Failed to fetch station reports:", error.message);
        res.status(500).json({ error: "Internal Server Error - Unable to fetch reports." });
    }
});

/**
 * @swagger
 * /api/reports/track/{refCode}:
 *   get:
 *     summary: Trace a single report using its unique 8-character reference code (Anonymous Tracking)
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: refCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique HEX reference code.
 *     responses:
 *       200:
 *         description: The matching report object.
 *       404:
 *         description: Report not found.
 */
app.get('/api/reports/track/:refCode', async (req, res) => {
    try {
        const { refCode } = req.params;

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('ref_code', refCode.toUpperCase())
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "No report found with the provided reference code." });
            }
            throw error;
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("CRITICAL ERROR: Failed to track report:", error.message);
        res.status(500).json({ error: "Internal Server Error - Unable to track report." });
    }
});

/**
 * @swagger
 * /api/reports/my:
 *   get:
 *     summary: Fetch all reports submitted by a specific user (Citizen View)
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the authenticated user.
 *     responses:
 *       200:
 *         description: List of the user's reports.
 */
app.get('/api/reports/my', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: "Query parameter 'user_id' is required." });
        }

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        console.error("CRITICAL ERROR: Failed to fetch user reports:", error.message);
        res.status(500).json({ error: "Internal Server Error - Unable to fetch your reports." });
    }
});

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`[Report Service] running on port ${PORT}`);
    console.log(`[Swagger Docs] available at http://localhost:${PORT}/api-docs`);
});