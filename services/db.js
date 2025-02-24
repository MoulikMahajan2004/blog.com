const mongo = require('mongoose');
mongo.connect('mongodb://127.0.0.1/blog').then(console.log("SUCCESSFULLY CONNECTED TO MONGO DB OF BLOG"));
module.exports = mongo;
