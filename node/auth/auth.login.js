const passport = require("passport");
const casLogin = function (req, res, next) {
  passport.authenticate("cas", function (err, user, info) {
    if (err) {
      return next(err);
    }

    if (!user) {
      req.session.messages = info.message;
      return res.redirect("/check");
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      req.session.messages = "";
      return res.redirect("/");
    });
  })(req, res, next);
};

module.exports = casLogin;
