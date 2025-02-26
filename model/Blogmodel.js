const { type } = require('os');
const mongo = require('../services/db');
const blogSchema = mongo.Schema({
    BlogCreatedBy: {
        type: String
    },
    Blogheading: {
        type: String
    },
    BlogData: {
        type: String
    },
    BlogImage: {
        type: Array,
        default: []
    },
    BlogVisibility:{
        type:String,
        default:"Public"
    }
})

module.exports = mongo.model("blogs", blogSchema);