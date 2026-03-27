require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');
const supabase = require('./db/supabase');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Utility to generate the 8-character reference code
const generateRefCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

// POST: Create a new incident report
app.post('/api/reports', async (req, res) => {
    try {
        const { user_id, station_id, incident_type, description, media_urls, is_anonymous } = req.body;

        const refCode = generateRefCode();
        
        // If anonymous, force user_id to be null regardless of what the client sent
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
                    is_anonymous 
                }
            ])
            .select();

        if (error) throw error;

        // Internal call to Notification Service would go here

        res.status(201).json({
            message: "Report submitted successfully",
            ref_code: refCode, // Crucial for the citizen to track it later
            report: data[0]
        });

    } catch (error) {
        console.error("Error inserting report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`[Report Service] running on port ${PORT}`);
});