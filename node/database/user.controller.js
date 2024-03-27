// const UserDetail = require("./models/user.js");
const {getUsers,getUser,createUser,deleteUser} = require('./database')

// Create and Save a User
exports.create = async (req, res) => {
  var date = new Date();

  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "User content can not be empty",
    });
  }
  // Create a User
  const user = await createUser(req.body.username || "Untitled User", date.toLocaleString())
  res.json(user);

};

// Retrieve and return all Users from the database.
exports.findAll = async (req, res) => {
  const users = await getUsers();
  res.json(users);
};

// Find a single user with a userId
exports.findOne = async (req, res) => {
  const users = await getUser(req.params.userId);
  if (user === null || user.length === 0){
    return res.status(404).send({
      message: "user not found with id " + req.params.userId,
    });
  }
  res.json(user)
};



// Retrieve current User
exports.currentUser = (req, res) => {
  if (
    res.locals.currentUser &&
    res.locals.currentUser.hasOwnProperty("username")
  ) {
    res.json({ user: res.locals.currentUser.username });
  } else {
    res.json({ user: "N/A" });
  }
};
