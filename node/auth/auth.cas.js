const CasStrategy = require("passport-cas").Strategy;
const users = require("../database/user.controller.js")


const casStrategy = new CasStrategy(
  {
    version: "CAS3.0",
    ssoBaseURL: "https://login.vt.edu/profile/cas",
    serverBaseURL: "https://bravesouls-projectdb.discovery.cs.vt.edu/api",
    validateURL: "/serviceValidate",
  },
  async function (profile, done) {
    var login = profile.user;
    users.findOne(login, function (err, obj) {
      console.log(obj);
      if (obj) {
        console.log("Found User: " + login);
        return done(null, obj);
      } else {
        users.createUser(login)
      }
    });
  }
);

module.exports = casStrategy;
