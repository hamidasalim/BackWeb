const axios = require('axios');

/**
 * Create Payment
 */
exports.createPayment = async (req, res) => {
    const { contract_id, journal, amount } = req.body;

    if (!contract_id || !journal || !amount) {
        return res.status(400).json({ error: 'Please provide contract_id, journal, and amount.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/create_payment_user`, {
            contract_id,
            journal,
            amount,
        });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};

/**
 * Fetch Payments by Email
 */
exports.getPaymentsByEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Please provide an email in the request body.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/payments_by_email`, { email });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};
