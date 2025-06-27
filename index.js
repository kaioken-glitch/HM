document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.getElementById("book-list");
  const form = document.getElementById("book-form");
  const filter = document.getElementById("filter");

  const API_URL = "http://localhost:3000/books";

  let books = [];

  // Fetch books from server
  function fetchBooks() {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        books = data;
        renderBooks(books);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        alert('Failed to load books. Please make sure the server is running.');
      });
  }

  // Render books to DOM
  function renderBooks(bookArray) {
    bookList.innerHTML = "";
    bookArray.forEach(book => {
      const li = document.createElement("li");
      li.className = "book-item";
      li.innerHTML = `
        <span><strong>${book.title}</strong> by ${book.author}</span>
        <span>Status: ${book.status}</span>
        <div>
          <button class="toggle-status" data-id="${book.id}">
            Mark as ${book.status === "read" ? "Unread" : "Read"}
          </button>
          <button class="delete-book" data-id="${book.id}">Remove</button>
        </div>
      `;
      bookList.appendChild(li);
    });
  }

  // Add a new book
  form.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;

    const newBook = {
      title,
      author,
      status: "unread"
    };

    fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(newBook)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(book => {
        books.push(book);
        renderBooks(books);
        form.reset();
      })
      .catch(error => {
        console.error('Error adding book:', error);
        alert('Failed to add book. Please try again.');
      });
  });

  // Handle toggle and delete
  bookList.addEventListener("click", e => {
    const id = e.target.dataset.id;

    // Toggle read/unread
    if (e.target.classList.contains("toggle-status")) {
      const book = books.find(b => b.id == id);
      const updatedStatus = book.status === "read" ? "unread" : "read";

      fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ status: updatedStatus })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(updatedBook => {
          books = books.map(b => b.id == id ? updatedBook : b);
          renderBooks(books);
        })
        .catch(error => {
          console.error('Error updating book status:', error);
          alert('Failed to update book status. Please try again.');
        });
    }

    // Remove book
    if (e.target.classList.contains("delete-book")) {
      fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          books = books.filter(b => b.id != id);
          renderBooks(books);
        })
        .catch(error => {
          console.error('Error deleting book:', error);
          alert('Failed to delete book. Please try again.');
        });
    }
  });

  // Filter books by status
  filter.addEventListener("change", e => {
    const value = e.target.value;
    let filteredBooks = books;

    if (value === "read") {
      filteredBooks = books.filter(book => book.status === "read");
    } else if (value === "unread") {
      filteredBooks = books.filter(book => book.status === "unread");
    }

    renderBooks(filteredBooks);
  });

  fetchBooks();
});
