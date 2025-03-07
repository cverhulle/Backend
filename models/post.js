const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    id: {type : String, required : true, unique : true},
    username: {type : String, required : true, unique : true},
    image: {type : String, required : true},
    content: {type : String, required : true},
    timestamp: {type : Date, required : true, default: Date.now},
})


module.exports = mongoose.model('Post', postSchema);