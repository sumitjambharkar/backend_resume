const mongoose = require('mongoose');
// Create a mongoose schema for user data
const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email:String,
    image:String,
    password:String
  });
  
module.exports = mongoose.model('User', userSchema);
  