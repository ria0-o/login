// Import required modules
require('./config/db');
const express = require('express');
const app = express();
const port = 3000;

const UserRouter = require('./api/User');

// Use the body parsing middleware built into Express for parsing JSON requests
app.use(express.json());

app.use('/user', UserRouter);

// Start the server
try {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
} catch (error) {
    console.error(`Server failed to start: ${error}`);
}

