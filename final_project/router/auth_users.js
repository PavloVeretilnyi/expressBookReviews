const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract ISBN parameter from request URL
    const isbn = req.params.isbn;
    const book = books[isbn];  // Retrieve book object associated with ISBN

    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Extract review from query string
    const review = req.query.review;
    if (!review) {
      return res.status(400).json({ message: "Review query parameter is required." });
    }

    // Get username from session
    const username = req.session.authorization?.username;
    if (!username) {
      return res.status(403).json({ message: "User not logged in." });
    }

    // Add or update review for this user
    book.reviews[username] = review;

    res.json({
      message: `Review for ISBN ${isbn} by ${username} has been added/updated.`,
      reviews: book.reviews
    });
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn]; // Get book by ISBN

  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  const username = req.session.authorization?.username;
  if (!username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: `No review found for user ${username} on ISBN ${isbn}.` });
  }

  // Delete only this user's review
  delete book.reviews[username];

  res.json({
    message: `Review by ${username} for ISBN ${isbn} has been deleted.`,
    reviews: book.reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
