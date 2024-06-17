const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};



public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(404).json({ message: "User already exists." });
  } else {
    users.push({ username: username, password: password });
    return res.status(200).json({ message: "User successfully registered. Please login." });
  }
});

const getAllBooks = () => {
    return new Promise((resolve, reject) => {
      resolve(books);
    });
  };
  
// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const targetISBN = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/books/${targetISBN}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
    const allBooks = await getAllBooks();
    const matchingBooks = Object.values(allBooks).filter(
      (book) => book.author.toLowerCase() === author
    );
    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books by that author." });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
    const allBooks = await getAllBooks();
    const matchingTitle = Object.values(allBooks).find(
      (book) => book.title.toLowerCase() === title
    );
    if (matchingTitle) {
      return res.status(200).json(matchingTitle);
    } else {
      return res.status(404).json({ message: "Title not found." });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get book review
public_users.get("/review/:isbn", async (req, res) => {
  const targetISBN = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/books/${targetISBN}`);
    if (response.data.reviews) {
      return res.status(200).send(JSON.stringify(response.data.reviews, null, 4));
    } else {
      return res.status(404).json({ message: "No reviews found for this book." });
    }
  } catch (error) {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

module.exports.general = public_users;
