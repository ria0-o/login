const mongoose = require('mongoose');


const URI = `mongodb+srv://adriansigno06:RBHEJo0MOlfM8t3j@cluster0.u0oef9s.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('DB Connected');
});

module.exports = mongoose; // Export the mongoose connection
