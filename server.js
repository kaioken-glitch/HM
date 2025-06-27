const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Path to the database file
const dbPath = path.join(__dirname, 'db.json');

// Helper function to read data from db.json
function readData() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { books: [] };
  }
}

// Helper function to write data to db.json
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// Helper function to generate unique ID
function generateId() {
  return Math.random().toString(36).substr(2, 4);
}

// Routes

// GET /books - Get all books
app.get('/books', (req, res) => {
  const data = readData();
  res.json(data.books);
});

// GET /books/:id - Get a specific book
app.get('/books/:id', (req, res) => {
  const data = readData();
  const book = data.books.find(b => b.id === req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

// POST /books - Add a new book
app.post('/books', (req, res) => {
  const data = readData();
  const { title, author, status = 'unread' } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }
  
  const newBook = {
    id: generateId(),
    title,
    author,
    status
  };
  
  data.books.push(newBook);
  
  if (writeData(data)) {
    res.status(201).json(newBook);
  } else {
    res.status(500).json({ error: 'Failed to save book' });
  }
});

// PATCH /books/:id - Update a book
app.patch('/books/:id', (req, res) => {
  const data = readData();
  const bookIndex = data.books.findIndex(b => b.id === req.params.id);
  
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  // Update the book with provided fields
  data.books[bookIndex] = { ...data.books[bookIndex], ...req.body };
  
  if (writeData(data)) {
    res.json(data.books[bookIndex]);
  } else {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const data = readData();
  const bookIndex = data.books.findIndex(b => b.id === req.params.id);
  
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  data.books.splice(bookIndex, 1);
  
  if (writeData(data)) {
    res.status(204).send();
  } else {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});