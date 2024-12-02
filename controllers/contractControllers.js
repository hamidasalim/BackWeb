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
    const { email, car_id, start_date, end_date, fuel_level } = req.body;

    // Validate required fields
    if (!email || !car_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'Please provide email, car_id, start_date, and end_date.' });
    }

    try {

        // Step 1: Create Contract
        
        const createContractResponse = await axios.post(`${process.env.BASE_URL}/create_contract_user`, {
            email,
            car_id,
            start_date,
            end_date,
            fuel_level,
        });
     
        // Extract contract_id for the payment step
        const contract_id = createContractResponse.data.result.contract_id;


        // Step 2: Create Payment
        const createPaymentResponse = await axios.post(`${process.env.BASE_URL}/create_payment_user`, {
            contract_id,
        });

        


        // Send the final response to the client after both steps are successful
        res.status(200).json({
            message: 'Contract created successfully!',
            contract: createContractResponse.data.result.contract_name
        });

    } catch (error) {
        console.error('Error occurred during contract/payment creation:', error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};


exports.CancelContract = async (req, res) => {
    const { email, contract_id} = req.body;

    if (!email || !contract_id ) {
        return res.status(400).json({ error: 'Please provide email, contract_id.' });
    }

    try {
        const response = await axios.post(`${process.env.BASE_URL}/cancel_contract_user`, {
            email,
            contract_id,
        });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};
