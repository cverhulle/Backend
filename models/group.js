const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    // On sauvegarde le nom du groupe.
    groupName: {
        type: String,
        required: true,
        // Permet de retirer les espaces vides
        trim: true
    },
    // On sauvegarde la description du groupe.
    groupDescription: {
        type: String,
        required: true,
        // Permet de retirer les espaces vides
        trim: true
    },
    // On sauvegarde le type du groupe.
    groupType: {
        type: String,
        enum: ['Public', 'Privé', 'Restreint'],
        required: true
    },
    // On sauvegarde le mot de passe (il n'y en a un que si le groupe est de type Restreint)
    groupPassword: {
        type: String,
        required: function() {
        return this.groupType === 'Restreint';
        }
    },
    // On sauvegarde le tableau des languages
    groupLanguages: {
        type: [String],
    },
    // On sauvegarde le tableau des catégories
    groupCategories: {
        type: [String],
    },
    // On sauvegarde le logo du group (le path)
    groupLogoPath: {
        type: String
    },
    // On sauvegarde la date de création du groupe
    createdAt: {
        type: Date,
        default: Date.now
    },
    // On gère les membres du groupe
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);