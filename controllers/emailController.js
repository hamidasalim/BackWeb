const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email (configured in .env)
        pass: process.env.EMAIL_PASS  // App Password (configured in .env)
    }
});

// Controller to handle sending emails
const sendEmail = async (req, res) => {
    const { name, email, message } = req.body; // Extract form data

    try {


        // Define the email content
        const mailOptions = {
            from: `"Website Contact Form" <${process.env.EMAIL_USER}>`, // Sender (your email)
            to: 'loleague331@gmail.com', // Receiver (your email)
            replyTo: email, // Allows you to reply directly to the sender
            subject: `New Message from ${name}`, // Subject line
            text: `You have received a new message from your website contact form.\n\n
                   Name: ${name}\n
                   Sender's Email: ${email}\n
                   Message:\n
                   ${message}`
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Respond to the frontend
        res.status(200).send({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);

        // Handle errors and send a response with the error details
        res.status(500).send({ message: 'Failed to send your message. Please try again later.', error });
    }
};

module.exports = { sendEmail };
