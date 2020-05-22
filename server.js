const express    = require("express");
const bodyParser = require("body-parser");
const Cloudant   = require("@cloudant/cloudant");
const app        = express();


const keys=require('./config/keys.js');


//DB Integration
const cloudant = new Cloudant({
  url:
    "https://768deb48-a427-41bb-bdcf-56eab94d8625-bluemix.cloudantnosqldb.appdomain.cloud",
  plugins: {
    iamauth: { iamApiKey: keys.apikey },
  },
});


//Body-Parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("public"));



app.get("/register.html", function (req, res) {
  res.sendFile(__dirname + "/" + "register.html");
});

app.post("/process_post", urlencodedParser, function (req, res) {
  // Prepare output in JSON format
  response = {
    Shop_name: req.body.shop_name,
    Owner_name: req.body.owner_name,
    email: req.body.email,
  };

  console.log(response);
  res.end(JSON.stringify(response));
  console.log("Creating document 'mydoc'");
  var db = cloudant.db.use("stores");
  // specify the id of the document so you can update and delete it later
  db.insert(
    {
      _id: "mydoc",
      shop_name: req.body.shop_name,
      Category: req.body.owner_name,
      Email: req.body.email,
      Location: "ABC",
    },
    function (err, data) {}
  );
});

var server = app.listen(8081, function () {
  console.log("Server running at port 8081");
  cloudant.db.list(function (err, allDbs) {
    console.log("All my databases: %s", allDbs.join(", "));
  });
});
