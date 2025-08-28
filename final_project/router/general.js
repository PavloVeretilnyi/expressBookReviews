const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    //res.send(JSON.stringify(books,null,4));
    //same functionality but with Promise based implementation:
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
        resolve(books);   // Resolve with the books object
        } else {
        reject("No books available");
        }
    });

    getBooks
    .then(result => {
      res.send(JSON.stringify(result, null, 4));
    })
    .catch(error => {
      res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Retrieve the ISBN parameter from the request URL and send the corresponding books's details
    const isbn = req.params.isbn;
    //res.send(books[isbn])
    //same functionality but with Promise based implementation
    const getBookByISBN = new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(`Book with ISBN ${isbn} not found`);
      }
    });  
    
    getBookByISBN
      .then(result => {
        res.send(result);
      })
      .catch(error => {
        res.status(404).json({ message: error });
      });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let author = decodeURIComponent(req.params.author).toLowerCase();
    /*let results = Object.values(books).filter(
        book => book.author.toLowerCase() === author
    );
    res.send(results);*/
    //same functionality but with Promise based implementation:
    const getBooksByAuthor = new Promise((resolve, reject) => {
      let results = Object.values(books).filter(
        book => book.author.toLowerCase() === author
      );  
      if (results.length > 0) {
        resolve(results);
      } else {
        reject(`No books found for author: ${author}`);
      }
    });
  
    getBooksByAuthor
      .then(results => {
        res.send(results);
      })
      .catch(error => {
        res.status(404).json({ message: error });
      });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = decodeURIComponent(req.params.title).toLowerCase();
    /*let results = Object.values(books).filter(
    book => book.title.toLowerCase() === title
    );
    res.send(results);*/
    //same functionality but with Promise based implementation:
    const getBooksByTitle = new Promise((resolve, reject) => {
        let results = Object.values(books).filter(
          book => book.title.toLowerCase() === title
        );
        if (results.length > 0) {
          resolve(results);
        } else {
          reject(`No books found with title: ${title}`);
        }
    });
    
    getBooksByTitle
        .then(results => {
          res.send(results);
        })
        .catch(error => {
          res.status(404).json({ message: error });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});

module.exports.general = public_users;
