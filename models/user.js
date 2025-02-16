const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const userSchema = mongoose.Schema({
    personalInfo: { type: [String], required: true},
    emailInfo: { type: [String], required: true},
    loginInfo: { type: [String], required: true},
    image: { type: String, required: true},
});

userSchema.plugin(uniqueValidator);


module.exports = mongoose.model('User', userSchema);