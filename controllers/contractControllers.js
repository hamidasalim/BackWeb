const axios = require('axios');

/**
 * Fetch Contracts by Email
 */
exports.getContractsByEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Please provide an email in the request body.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/contracts_by_email`, { email });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

/**
 * Create Contract
 */
exports.createContract = async (req, res) => {
    const { email, car_id, start_date, end_date, acompte } = req.body;

    if (!email || !car_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'Please provide email, car_id, start_date, and end_date.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/create_contract_user`, {
            email,
            car_id,
            start_date,
            end_date,
            acompte,
        });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};
