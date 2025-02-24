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
    }
})

module.exports = mongo.model("blogs", blogSchema);