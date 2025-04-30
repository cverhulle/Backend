const mongoose = require('mongoose');

// Ce modèle permet de sauvegarder un post entre deux utilisateurs en chat privé
const postSchema = new mongoose.Schema({
    postId: {type : String, required : true},
    currentUserId: {type : String, required : true},
    otherUserId: {type : String, required : true},
    username: {type : String, required : true},
    image: {type : String, required : true},
    content: {type : String, required : true},
    timestamp: {type : Date, required : true, default: Date.now},
    imageInChat: {type : String}
})


module.exports = mongoose.model('Post', postSchema);