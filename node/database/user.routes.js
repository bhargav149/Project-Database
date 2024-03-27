module.exports = (app) => {
  const users = require("./user.controller.js");
  const isAuthenticated = require("../auth/auth.status.js");
  var bodyParser = require("body-parser");

  // create application/json parser
  var jsonParser = bodyParser.json();

  // Create a new User
  app.post("/api/users", isAuthenticated, jsonParser, users.create);

  // Retrieve all Users
  app.get("/api/users", isAuthenticated, users.findAll);

  // Retrieve a single User with userId
  app.get("/api/users/:userId", isAuthenticated, users.findOne);

  // Retrieve current User
  app.get("/api/currentUser", isAuthenticated, users.currentUser);
};
