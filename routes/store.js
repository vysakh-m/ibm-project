const express   = require("express");
const Cloudant  = require("@cloudant/cloudant");
const session   = require("client-sessions");
const router    = express();

const isEmpty = require("../validation/is-empty");
const cloudant = require("../db/db");

router.use(
  session({
    cookieName: "store_session",
    secret: "store-secret-session",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);

var db = cloudant.db.use("stores");
var sd = cloudant.db.use("stores_data");

router.post("/register", function (req, res) {
  // Prepare output in JSON format
  response = {
    name: req.body.shop_name,
    Owner_name: req.body.owner_name,
    email: req.body.email,
    mobile: req.body.number,
    category: req.body.category,
    location: req.body.location,
    password: req.body.password,
  };
  // specify the id of the document so you can update and delete it later
  db.insert(response, (err, data) => {
    console.log("Insert Successfull");
    return res.json({ status: "Data Insertion Successful" });
  });
});

router.post("/login", (req, res) => {
  db.find({ selector: { email: req.body.email } }, (err, result) => {
    if (isEmpty(result.docs)) {
      res.status(400).json({ status: "User does not exist" });
    } else {
      if (result.docs[0].password === req.body.password) {
        req.store_session.store_email = req.body.email;
        req.store_session.store_name = result.docs[0].name;
        payload = {
          shop_name: result.docs[0].name,
          owner_name: result.docs[0].Owner_name,
          category: result.docs[0].category,
        };
        res.json({
          status: "Authentication Successful",
          validUser: true,
          user_data: payload,
        });
      } else {
        res.json({ status: "Authentication Unsuccessful", validUser: false });
      }
    }
  });
});

router.get("/home", (req, res) => {
  sd.find(
    { selector: { email: req.store_session.store_email } },
    (err, result) => {
      return res.json(result.docs);
    }
  );
});

router.post("/additem", (req, res) => {
  var flag = 0;
  sd.find(
    { selector: { email: req.store_session.store_email } },
    (err, result) => {
      console.log(result.docs);
      if (isEmpty(result.docs)) {
        response = {
          email: req.store_session.store_email,
          data: [
            {
              item: req.body.item,
              count: req.body.count,
            },
          ],
        };
        sd.insert(response, (err, data) => {
          console.log("Insertion Successful");
          return res.json(response);
        });
      } else {
        sd.destroy(result.docs[0]._id, result.docs[0]._rev)
          .then((body) => {
            console.log("Successfully Destroyed");
          })
          .catch((err) => {
            console.log(err);
          });
        console.log("Updating Values");
        const stats = result.docs[0];
        const stats_data = result.docs[0].data;

        var index;
        for (i = 0; i < stats_data.length; i++) {
          if (stats_data[i].item === req.body.item) {
            console.log("JABA");
            flag = 1;
            index = i;
            break;
          } else {
            console.log("BAJA");
            flag = 0;
          }
        }
        if (flag == 1) {
          var c1 = parseInt(stats_data[index].count);
          var c2 = parseInt(req.body.count);
          var c3 = c1 + c2;
          var c4 = c3.toString();
          stats_data[index].count = c4;
        } else {
          stats_data.unshift({
            item: req.body.item,
            count: req.body.count,
          });
          console.log("TEST");
          console.log(stats_data);
        }
        stats.data = stats_data;
        delete stats._id;
        delete stats._rev;
        console.log(stats);
        sd.insert(stats, (err, data) => {
          console.log("Updated Insertion successfull");
          return res.json(stats);
        });
      }
    }
  );
});

router.get("/logout", (req, res) => {
  console.log(req.store_session.store_name);
  if (!req.store_session.store_name) {
    console.log("No user logged in");
    return res.json({ currentUser: "None" });
  } else {
    const user = req.store_session.store_name;
    req.store_session.reset();
    console.log(`Logout Successfull : ${user}`);
    return res.json({ loggedOutUser: user });
  }
});

module.exports = router;
