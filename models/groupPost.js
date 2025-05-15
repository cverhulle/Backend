const mongoose = require('mongoose');

// Ce modèle permet de sauvegarder un post dans un groupe de discussion.
const groupPostSchema = new mongoose.Schema({

    // Id du post
    postId: { type: String, required: true },

    // Id du groupe
    groupId: { type: String, required: true },

    // Id de l'expéditeur du message
    senderId: { type: String, required: true },

    // Username de l'expéditeur
    senderUsername: { type: String, required: true },

    // Image de profil de l'expéditeur
    senderProfileImage: { type: String, required: true },

    // Contenu du message
    content: { type: String, required: true },

    // Date du message
    timestamp: { type: Date, required: true, default: Date.now },

    // Image contenu dans le message
    imageInChat: { type: String, default: null }
});

module.exports = mongoose.model('GroupPost', groupPostSchema);