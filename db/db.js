const Cloudant   = require("@cloudant/cloudant");


const keys=require('../config/keys.js');


//DB Integration
const cloudant = new Cloudant({
  url:
    "https://768deb48-a427-41bb-bdcf-56eab94d8625-bluemix.cloudantnosqldb.appdomain.cloud",
  plugins: {
    iamauth: { iamApiKey: keys.apikey },
  },
});

module.exports=cloudant;