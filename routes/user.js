const express   = require("express");
const Cloudant  = require("@cloudant/cloudant");
const session   = require("client-sessions");
const router    = express();

const isEmpty = require("../validation/is-empty");
const cloudant = require("../db/db");

router.use(
  session({
    cookieName: "user_session",
    secret: "store-secret-session",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);

var db = cloudant.db.use("user");
var ud = cloudant.db.use("user_data");

router.post('/register',(req,res)=>{
  data={
    name:req.body.name,
    address:req.body.address,
    number:req.body.number,
    email:req.body.email,
    location:req.body.location,
    password:req.body.password,
    password2:req.body.password2
  }
  db.find({selector:{email:req.body.email}},(err,response)=>{
    if(!isEmpty(response.docs)){
      return res.json({status:"User already exists"});
    }else{
      db.insert(data,(err,data)=>{
        req.user_session.user_email = req.body.email;
        req.user_session.user_name = req.body.name;
        return res.json({status:"Registration Successfull"});
      })
    }
  })
})

router.post('/login',(req,res)=>{
  data={
    email:req.body.email,
    password:req.body.email
  }
  db.find({selector:{email:req.body.email}},(err,response)=>{
    if(isEmpty(response.docs)){
      return res.json({status:"Invalid Email"});
    }else{    
      if(response.docs[0].password===req.body.password){
        delete response.docs[0].password;
        req.user_session.user_email = req.body.email;
        req.user_session.user_name = response.docs[0].name;
        return res.json({data:response.docs[0],status:"Authentication Successfull"})
      }else{
        return res.json({status:"Invalid Password"});
      }
    }
  })
});

router.post('/post_order',(req,res)=>{
  
})

router.post('/item/:category',(req,res)=>{

  
})


module.exports=router;