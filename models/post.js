const mongoose = require('mongoose');

// Ce modèle permet de sauvegarder un post entre deux utilisateurs en chat privé
const postSchema = new mongoose.Schema({

    // Id du post
    postId: {type : String, required : true},

    // Id de l'utilisateur qui écrit le message
    currentUserId: {type : String, required : true},

    // Id de l'utilisateur ecevant un message 
    otherUserId: {type : String, required : true},

    // Username de l'utilisateur qui envoie le message
    username: {type : String, required : true},

    // Image de profil de l'utilisateur qui envoie le message
    image: {type : String, required : true},

    // Contenu du message
    content: {type : String, required : true},

    // Date du meesage
    timestamp: {type : Date, required : true, default: Date.now},

    // Image dans le message
    imageInChat: {type : String}
})


module.exports = mongoose.model('Post', postSchema);