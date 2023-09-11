const dbConnect = require("../src/dbConnect");
const User = require("../src/user");
const bcrypt = require('bcrypt');
dbConnect();
const express = require('express');
const jwt = require("jsonwebtoken");
const auth = require("./auth")
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Create an array to store invalidated tokens
const tokenBlacklist = [];

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.post("/register", async (request, response) => {
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const user = new User({
      email: request.body.email,
      password: hashedPassword,
    });

    const result = await user.save();
    response.status(201).send({
      message: "User Created Successfully",
      result,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    response.status(500).send({
      message: "Error creating user",
      error: error.message,
    });
  }
});

// login endpoint
app.post("/login", (request, response) => {
  // Check if email exists
  User.findOne({ email: request.body.email })
    .then((user) => {
      // Compare the password entered and the hashed password found
      bcrypt.compare(request.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return response.status(400).send({
              message: "Passwords do not match",
            });
          }

          // Create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          // Return success response with token
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
          console.log("Logged in token is", token);
        })
        .catch((error) => {
          response.status(400).send({
            message: "Passwords do not match",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// Logout endpoint
app.post("/logout", (request, response) => {
  const tokenToInvalidate = request.body.token;
  console.log("The token is", tokenToInvalidate);
  if (!tokenToInvalidate) {
    return response.status(400).send({
      message: "Token not provided in the request body",
    });
  }

  // Add the token to the blacklist
  tokenBlacklist.push(tokenToInvalidate);

  response.status(200).send({
    message: "Logout Successful",
  });
});

app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  // Check if the token is in the blacklist before granting access
  if (tokenBlacklist.includes(request.token)) {
    return response.status(401).send({
      message: "Unauthorized",
    });
  }

  response.json({ message: "You are authorized to access me" });
});

app.listen(3000, '127.0.0.1');
module.exports = app;