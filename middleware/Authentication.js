const jwt = require('jsonwebtoken');
const { Module } = require('module');
const { model } = require('mongoose');
const UserModel = require('../model/usermodel');

function RoleBasedAccess(Roles){
    return async (req,res,next)=>
{
    //Console.log("Role Triggered");
    //in this we are redirecting to the main page if the token is not present
    if(!req.cookies.Token) return res.redirect('/');

    //storing the token 
    const Token = req.cookies.Token;
    const TokenString = jwt.verify(Token,"test");
    const UserRole = await UserModel.findOne({Email:TokenString.Email});
    console.log("Roles",Roles,UserRole.Role);
    if(Roles!=UserRole.Role){res.redirect('/')}
    else{
    next();
    }
  //  Roles=UserRole?:res.redirect('/login');
   // console.log("Middleware tirgger and token is",TokenString);
    
}}
module.exports = {RoleBasedAccess};