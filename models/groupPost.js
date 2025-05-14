const mongoose = require('mongoose');

// Ce modèle permet de sauvegarder un post dans un groupe de discussion.
const groupPostSchema = new mongoose.Schema({
    postId: { type: String, required: true },
    groupId: { type: String, required: true },
    senderId: { type: String, required: true },
    senderUsername: { type: String, required: true },
    senderProfileImage: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    imageInChat: { type: String, default: null }
});

module.exports = mongoose.model('GroupPost', groupPostSchema);