# Node Express Application

Simple Node-Express Application as part of the VT CAS MERN Stack

## Components
---

### **CAS Authentication**

Uses [passport-cas](https://www.npmjs.com/package/passport-cas) npm package to authenicate with VT CAS Server

The cas strategy is specified in auth/auth.cas.js where the ssoBaseURL, serverBaseURL, validateURl, and others are specified.

### **MongoDB Integration**

Uses [mongoose](https://www.npmjs.com/package/mongoose) npm package as a object modeling tool for interactions with MongoDB

The connection to MongoDB is done in server.js (lines 11-21). This grabs the MongoDB URL which is specified in database/config/database.config.js.

## Local Development

---

User must create a local instance of MongoDB and set the url in the file specified above.

Develop locally at localhost:5000

run `node server.js`

## Docker

---

1. Build Image

        docker build . -t docker.cs.vt.edu/<repository>/<tag>

2. Login to VT Docker

        docker login docker.cs.vt.edu

3. Push Image

        docker push docker.cs.vt.edu/<repository>/<tag>

## API

### Database Routes
    Create User
    POST    /api/users

    Retrieve All Users
    GET     /api/users

    Retrieve User by userId
    GET     /api/users/:userId

    Update User by userId
    PUT     /api/users/:userId

    Delete User by userId
    DELETE  /api/users/:userId

    Retrieve Current User
    GET     /api/currentUser

    Create Course
    POST    /api/courses

    Retrieve All Courses
    GET     /api/courses

    Retrieve Course by courseNumber
    GET     /api/courses/:courseNumber

    Update Course by courseNumber
    PUT     /api/courses/:uscourseNumbererId

    Delete Course by courseNumber
    DELETE  /api/courses/:courseNumber

## Database Schema

Defined in database/models/user.js
        
    _id: ObejctID
    username: String
    timeStamp: String

Defined in database/models/course.js
        
    _id: ObejctID
    classname: String
    courseNumber: Number
    Professor: String
    Location: String

## About

---

Created by Docker Workers Fall 2022

Miguel Alonso, Charles Cabauatan, John Oh, and Nathan Bolduc