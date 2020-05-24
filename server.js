const express    = require("express");
const bodyParser = require("body-parser");

const app        = express();

const cloudant=require('./db/db')

//Body-Parser
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("style"));

app.use('/store', require('./routes/store'));
app.use('/user',require('./routes/user'));



app.get('/', function(req,res){
  res.render('landing.ejs')
})

app.listen(8081, function () {
  console.log("Server running at port 8081");
  cloudant.db.list(function (err, allDbs) {
    console.log("All my databases: %s", allDbs.join(", "));
  });
});
