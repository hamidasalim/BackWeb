const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./middleware/middle');
const { sendEmail } = require('./controllers/emailController');

router.post('/send-email', sendEmail);


// Import controllers
const contractController = require('./controllers/contractControllers');
const paymentController = require('./controllers/paymentControllers');
const userController = require('./controllers/userControllers');
const vehicleController = require('./controllers/vehiculeControllers');
const upload = require('./middleware/multer'); // Import the multer configuration
// Public Routes (No Authentication Required)
router.post('/users/login', userController.loginUser);
router.post('/users/register', userController.registerUser);
router.post('/vehicles/available', vehicleController.getAvailableVehicles);




// Protected Routes (Require Authentication)

router.post('/users/update', authenticateToken, userController.updateUser);
router.post('/users/password', authenticateToken, userController.updatePaswword);
router.post('/users/getUser', authenticateToken, userController.getUser);
router.post('/contracts/email', authenticateToken, contractController.getContractsByEmail);
router.post('/contracts/cancel', authenticateToken, contractController.CancelContract);
router.post('/contracts/create', authenticateToken, contractController.createContract);
router.post('/payments/create', authenticateToken, paymentController.createPayment);
router.post('/payments/email', authenticateToken, paymentController.getPaymentsByEmail);

module.exports = router;