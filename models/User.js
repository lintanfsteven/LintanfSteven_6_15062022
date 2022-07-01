const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

// mongoose allows us to set up a unique validator check for signup
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);