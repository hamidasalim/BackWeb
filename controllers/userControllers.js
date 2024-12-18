const axios = require('axios');
const jwt = require('jsonwebtoken'); // For generating a token
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const path = require('path');


// Secret key for signing tokens (ensure this is secure and stored safely)

/**
 * Login User
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(email)
    console.log(password)

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password.' });
    }
    // Validate password length
    if (password.length < 8 || password.length > 16) {
        return res.status(400).json({ error: 'Password must be between 8 and 16 characters.' });
    }

    try {

        // Make the login request to the Odoo API
        const response = await axios.post(`${process.env.BASE_URL}/login_user`, { email, password });
        if (response.data.result.error){
            res.status(500).json({ error: response.data.result.error });
        }

        console.log(response.data)

        // Generate a JWT token
        const token = jwt.sign({ email: response.data.result.user_data.email, name: response.data.result.user_data.name }, process.env.SECRET_KEY, {
            expiresIn: '24h',
        });

        // Respond with user data and token
        res.status(200).json({
            message: 'Login successful!',
            user: response.data.result.user_data,
            token, // Return the token to the frontend
        });
    } catch (error) {
        console.error('Error in loginUser:', error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};


/**
 * Register User
 */


exports.registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            street,
            street2,
            city,
            postalCode,
            mobile,
            dob,
            cinNumber,
            cinDate,
            driverLicenseNumber,
            driverLicenseCategory,
            driverLicenseDate,

        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Validate password length
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ error: 'Password must be between 8 and 16 characters.' });
        }




        // TODO: Send data and file paths to Odoo API
        const response = await axios.post(`${process.env.BASE_URL}/register_user`, {
            name,
            email,
            password,
            street,
            street2,
            city,
            zip: postalCode,
            mobile,
            x_date_of_birth: dob,
            cin_number: cinNumber,
            x_cin_issue_date: cinDate,
            driver_license_number: driverLicenseNumber,
            x_license_category: driverLicenseCategory,
            x_license_issue_date: driverLicenseDate,

            is_locataire: true
        });

        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
};


/**
 * Update User
 */
exports.updateUser = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required to identify the user.' });
        }

        // Prepare the data for Odoo endpoint
        const data = { email, ...updateData };


        // Send the update request to Odoo API
        const response = await axios.post(`${process.env.BASE_URL}/update_user`, data);

        // If Odoo responds with a success message, return the success message from our Node.js endpoint
        if (response.data.result.updated_fields) {
            return res.status(200).json({
                message: response.data.result.message,
                updatedFields: response.data.result.updated_fields
            });
        }

        // Handle any errors returned by the Odoo API
        return res.status(400).json({ error: response.data.error || 'Error updating user in Odoo.' });

    } catch (error) {
        console.error('Error in updateUser:', error.message);
        return res.status(500).json({ error: error.response?.data || 'Error processing request.' });
    }
};

exports.updatePaswword = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required to identify the user.' });
        }

        // Prepare the data for Odoo endpoint
        const data = { email, ...updateData };

        // Send the update request to Odoo API
        const response = await axios.post(`${process.env.BASE_URL}/update_password`, data);

        // If Odoo responds with a success message, return the success message from our Node.js endpoint
        if (response.data.result.message == 'Password updated successfully') {
            return res.status(200).json({
                message: response.data.result.message,
            });
        }

        // Handle any errors returned by the Odoo API
        return res.status(400).json({ error: response.data.error || 'Error updating user in Odoo.' });

    } catch (error) {
        console.error('Error in updateUser:', error.message);
        return res.status(500).json({ error: error.response?.data || 'Error processing request.' });
    }
};
exports.getUser = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required to identify the user.' });
        }

        // Prepare the data for Odoo endpoint
        const data = { email};

        // Send the update request to Odoo API
        const response = await axios.post(`${process.env.BASE_URL}/get_user`, data);

        // If Odoo responds with a success message, return the success message from our Node.js endpoint
        if (response.data.result.user_data ) {
            return res.status(200).json({
                user:response.data.result.user_data,
                message: response.data.message,
            });
        }

        // Handle any errors returned by the Odoo API
        return res.status(400).json({ error: response.data.error || 'Error fetching user in Odoo.' });

    } catch (error) {
        console.error('Error in updateUser:', error.message);
        return res.status(500).json({ error: error.response?.data || 'Error processing request.' });
    }
};