var app = require("express")();
const session = require("express-session");
app.use(
  session({
    secret: "this is totally secret",
    resave: false,
    saveUninitialized: false,
  })
);

const PORT = 5000;

// CAS
const passport = require("passport");
const casStrategy = require("./auth/auth.cas.js");
app.use(passport.initialize());
app.use(passport.session());
passport.use(casStrategy);
passport.serializeUser(function (user, done) {
  done(null, user.username);
});
passport.deserializeUser(function (username, done) {
  done(null, {
    username,
  });
});

// Set Current User
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// Import Routes
require("./auth/auth.routes.js")(app);
require("./database/user.routes.js")(app);

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
