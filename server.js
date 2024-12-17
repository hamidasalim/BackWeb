require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],// Allow only your frontend's origin
    credentials: true, // Allow credentials such as cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.use('/api', routes);

if (require.main === module) {
    // Start the server only if this file is executed directly
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export the app for testing or external usage
module.exports = app;
