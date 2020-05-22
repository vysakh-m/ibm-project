const express    = require("express");
const bodyParser = require("body-parser");

const app        = express();


const cloudant=require('./db/db')

//Body-Parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("styles"));


app.use('/store', require('./routes/store'));

app.get('/', function(req,res){
  res.send("Hi")
})

app.listen(8081, function () {
  console.log("Server running at port 8081");
  cloudant.db.list(function (err, allDbs) {
    console.log("All my databases: %s", allDbs.join(", "));
  });
});
