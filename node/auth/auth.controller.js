// Retrieve and return all Users from the database.
exports.login = (req, res) => {
  res.json({ username: res.locals.currentUser });
};

// Retrieve and return all Users from the database.
exports.logout = (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("https://login.vt.edu/profile/cas/logout");
  });
};
