const jwt = require('jsonwebtoken');
const { Module } = require('module');
const { model } = require('mongoose');

async function CheckAuth(req,res,next)
{
    //in this we are redirecting to the main page if the token is not present
    if(!req.cookies.Token) return res.redirect('/');

    //storing the token 
    const Token = req.cookies.Token;
    const TokenString = jwt.verify(Token,"test",(err,check)=>{return check});
    console.log("Middleware tirgger and token is",TokenString);
    next();
}
module.exports = {CheckAuth};