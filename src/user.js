const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true, // Ensures that each email is unique
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number,  // You can change the data type if needed
    default: 0,    // Set the default value to 0 or any other initial value
  },
});

module.exports = mongoose.model('User', userSchema);
