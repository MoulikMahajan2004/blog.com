const { strict } = require('assert');
const mongo = require('../services/db');
const { emitWarning } = require('process');
const { type } = require('os');

const userschema = mongo.Schema({
    Username: {
        type: String,
        strict
    },
    Email: {
        type: String,
        strict
    },
    Password: {
        type: String,
    },
    CreatedOn:
    {
        type: Date,
        default: Date.now()
    },
    Role:{
        type:String,
        default:'Normal'
    },
    BlogPost:{
        type:Array,
        default:[]
    },
    ProfilePicture:{
        type:String,
        default:"image.png"
        
    }
})

module.exports=mongo.model("users", userschema);

