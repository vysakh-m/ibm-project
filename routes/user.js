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
var vt = cloudant.db.use("volunteer");
var st = cloudant.db.use("stores");
router.get('/login',(req,res)=>{
  res.render('user_login.ejs')
})
router.get('/register',(req,res)=>{
  res.render('user_register.ejs')
})

router.get('/dashboard',(req,res)=>{
  if(!req.user_session.user_email){
    res.redirect('login')
  }else{
    res.render('user_dashboard.ejs',{
      name:req.user_session.user_name
    })
  }
  
})

router.get('/volunteer',(req,res)=>{
  vt.find({selector:{}},(err,response)=>{
    res.render('volunteer.ejs',{
      data:response.docs
    })
  })
})
router.get('/map',(req,res)=>{
  res.render('map.ejs');
})



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
      res.redirect('login')
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
        res.redirect('dashboard')
      }else{
        res.redirect('login')
      }
    }
  })
});

router.get('/category/:id',(req,res)=>{
  var cat="";
  if(req.params.id==1){
    cat="Food";
  }else if(req.params.id==2){
    cat="Mobile Store"
  }else if(req.params.id==3){
    cat="Daily Essentials"
  }else if(req.params.id==4){
    cat="Medicine"
  }else{
    res.redirect('dashboard');
  }
  st.find({selector:{category:cat}},(err,response)=>{
    res.render('user_category.ejs',{
      data:response.docs
    })
  })
  
})




router.get("/logout", (req, res) => {
  console.log(req.user_session.user_name);
  if (!req.user_session.user_name) {
    res.redirect('login');
  } else {
    const user = req.user_session.user_name;
    req.user_session.reset();
    console.log(`Logout Successfull : ${user}`);
    res.redirect('login');
  }
});

module.exports=router;