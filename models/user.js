const mongoose = require('mongoose');



const userSchema = mongoose.Schema({
    personalInfo: { 
        firstName: { type: String, required: true},
        lastName: { type: String, required: true},
    },
    emailInfo: { 
        email: { type: String, required: true, unique: true},
        confirmEmail: { type: String, required: true},
    },
    loginInfo: {
        username: { type: String, required: true, unique: true},
        password: { type: String, required: true},
        confirmPassword: { type: String, required: true},
    },
    image: { type: String, required: true},
});




module.exports = mongoose.model('User', userSchema);