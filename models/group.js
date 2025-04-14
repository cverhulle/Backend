const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,

        // Permet de retirer les espaces vides
        trim: true
    },
    groupDescription: {
        type: String,
        required: true,

        // Permet de retirer les espaces vides
        trim: true
    },
    groupType: {
        type: String,
        enum: ['Public', 'Privé', 'Restreint'],
        required: true
    },
    groupPassword: {
        type: String,
        required: function() {
        return this.groupType === 'Restreint';
        }
    },
    groupLanguages: {
        type: [String],
    },
    groupCategories: {
        type: [String],
    },
    groupLogoPath: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);