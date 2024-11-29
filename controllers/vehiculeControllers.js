const axios = require('axios');

/**
 * Fetch Available Vehicles
 */
exports.getAvailableVehicles = async (req, res) => {
    const { start_date, end_date } = req.body;

    if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Please provide both start_date and end_date in YYYY-MM-DD format.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/available_cars`, { start_date, end_date });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};
