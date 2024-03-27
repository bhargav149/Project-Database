const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.json({ message: "Not Authenticated" });
  }
};

module.exports = isAuthenticated;
