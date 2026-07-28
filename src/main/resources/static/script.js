// Fetch and render data - Using existing HTML structure but making it robust
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "/api";
  const AUTH_BASE_URL = "/auth";

  const mainContent = document.getElementById("main-content");
  const authModal = document.getElementById("auth-modal");
  const bookModal = document.getElementById("book-modal");
  const authForm = document.getElementById("auth-form");
  const bookForm = document.getElementById("book-form");
  const authMessage = document.getElementById("auth-message");
  const toggleAuthModeBtn = document.getElementById("toggle-auth-mode");
  const authSubmitButton = document.getElementById("auth-submit-button");
  const registerFields = document.getElementById("register-fields");
  const heroSectionHTML = `
            <section class="hero-section">
                <div class="hero-content">
                    <h2 class="hero-title">Discover Your Next Great Read</h2>
                    <p class="hero-subtitle">Join our community of book lovers
                        and explore thousands of titles</p>

                    <div class="benefits-grid">
                        <div class="benefit-card">
                            <div class="benefit-icon">📖</div>
                            <h3>Expand Your Mind</h3>
                            <p>Reading enhances knowledge, improves focus, and
                                opens new perspectives on the world.</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">🧠</div>
                            <h3>Boost Creativity</h3>
                            <p>Stories inspire imagination and help you think in
                                new ways, unlocking creative potential.</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">😌</div>
                            <h3>Reduce Stress</h3>
                            <p>Immerse yourself in captivating narratives and
                                find peace in the world of books.</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">🌍</div>
                            <h3>Connect Globally</h3>
                            <p>Explore diverse cultures and perspectives through
                                literature from around the world.</p>
                        </div>
                    </div>

                    <button id="hero-login-btn" class="hero-cta-button">Start
                        Reading Today</button>
                </div>

                <!-- New animated books section with page-flipping and book stacking animations -->
                <div class="hero-animations">
                    <div class="books-container">
                        <!-- Animated book stack -->
                        <div class="book-stack">
                            <div class="book book-1">
                                <div class="book-spine"></div>
                                <div class="book-cover">
                                    <div class="book-title">Gain knowledge</div>
                                </div>
                            </div>
                            <div class="book book-2">
                                <div class="book-spine"></div>
                                <div class="book-cover">
                                    <div class="book-title">Digital Dreams</div>
                                </div>
                            </div>
                            <div class="book book-3">
                                <div class="book-spine"></div>
                                <div class="book-cover">
                                    <div class="book-title">Future Tales</div>
                                </div>
                            </div>
                        </div>

                        <!-- Animated page flip -->
                        <div class="page-flip-container">
                            <div class="page-flip">
                                <div class="page page-front">
                                    <div class="page-content">
                                        <h3>Chapter 1</h3>
                                        <p>Begin your journey</p>
                                    </div>
                                </div>
                                <div class="page page-back">
                                    <div class="page-content">
                                        <h3>Chapter 2</h3>
                                        <p>Continue reading</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Floating books animation -->
                        <div class="floating-books">
                            <div class="float-book float-1">📕</div>
                            <div class="float-book float-2">📗</div>
                            <div class="float-book float-3">📘</div>
                            <div class="float-book float-4">📙</div>
                        </div>
                    </div>
                </div>
            </section>
  `;

  let isRegisterMode = false;

  function getAuthToken() {
    return localStorage.getItem("jwtToken");
  }

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  }

  function getUserRole() {
    const token = getAuthToken();
    if (token) {
      const decoded = parseJwt(token);
      return decoded ? decoded.role : null;
    }
    return null;
  }

  function getUsername() {
    const token = getAuthToken();
    if (token) {
      const decoded = parseJwt(token);
      return decoded ? decoded.sub : null;
    }
    return null;
  }

  async function fetchData(url, options = {}) {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // Check for 401 Unauthorized - meaning token is expired/invalid
    if (response.status === 401) {
      localStorage.removeItem("jwtToken");
      updateUIForRole();
      renderHome();
      alert("Your session has expired. Please login again.");
      throw new Error("Session expired");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        // Handle validation errors from backend mapped as map
        if (errorData && typeof errorData === "object" && !errorData.error) {
          errorMessage = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
        } else {
          errorMessage = errorData.error || response.statusText;
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    // Handle empty responses (like DELETE)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  }

  function updateUIForRole() {
    const role = getUserRole();
    const username = getUsername();

    document
      .querySelectorAll(".admin-only")
      .forEach(
        (el) => (el.style.display = role === "ADMIN" ? "block" : "none"),
      );
    document
      .querySelectorAll(".user-only")
      .forEach((el) => (el.style.display = role === "USER" ? "block" : "none"));

    const loginBtn = document.getElementById("nav-login");
    const logoutBtn = document.getElementById("nav-logout");
    const welcomeMsg = document.getElementById("welcome-message");

    if (role) {
      loginBtn.style.display = "none";
      logoutBtn.style.display = "block";
      welcomeMsg.style.display = "block";
      welcomeMsg.textContent = `Welcome, ${username}!`;
    } else {
      loginBtn.style.display = "block";
      logoutBtn.style.display = "none";
      welcomeMsg.style.display = "none";
    }
  }

  function toggleModal(modal, show) {
    if (show) {
      modal.classList.add("show");
    } else {
      modal.classList.remove("show");
    }
  }

  // Render Functions
  function renderHome() {
    mainContent.innerHTML = heroSectionHTML;
    const heroLoginBtn = document.getElementById("hero-login-btn");
    if (heroLoginBtn) {
      if (getAuthToken()) {
        heroLoginBtn.textContent = "Browse Books";
        heroLoginBtn.addEventListener("click", renderBooks);
      } else {
        heroLoginBtn.addEventListener("click", () => {
          isRegisterMode = false;
          document.getElementById("auth-modal-title").textContent = "Login";
          authSubmitButton.textContent = "Login";
          toggleAuthModeBtn.textContent = "Need an account? Register";
          registerFields.style.display = "none";
          authForm.reset();
          toggleModal(authModal, true);
        });
      }
    }
  }

  async function renderBooks() {
    try {
      const books = await fetchData(`${API_BASE_URL}/books`);
      const role = getUserRole();

      let html = `<div class="section-header">
                        <h2 class="section-title">Library Books</h2>
                        ${role === "ADMIN" ? `<button id="add-book-btn" class="action-button">Add New Book</button>` : ""}
                    </div>
                    <div class="list-container">`;

      books.forEach((book) => {
        html += `
                    <div class="card">
                        <h3>${book.title}</h3>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category}</p>
                        <p><strong>Rent:</strong> $${book.rentPerDay}/day</p>
                        <p><strong>Status:</strong> <span style="color: ${book.available ? "var(--success-color)" : "var(--accent-color)"}">${book.available ? "Available" : "Borrowed"}</span></p>

                        <div class="card-actions">
                            ${
                              role === "ADMIN"
                                ? `
                                <button class="edit-btn" data-id="${book.id}">Edit</button>
                                <button class="delete-btn" data-id="${book.id}">Delete</button>
                            `
                                : ""
                            }

                            ${
                              role === "USER" && book.available
                                ? `
                                <div class="borrow-controls">
                                    <label>Days to borrow:</label>
                                    <input type="number" id="days-${book.id}" class="days-input" min="1" max="30" value="14" data-rent="${book.rentPerDay}">
                                    <p>Est. Cost: <span id="cost-${book.id}">$${(book.rentPerDay * 14).toFixed(2)}</span></p>
                                    <button class="borrow-btn" data-id="${book.id}">Borrow Book</button>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>`;
      });
      html += `</div>`;
      mainContent.innerHTML = html;
      attachBookEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Error loading books: ${error.message}</p>`;
    }
  }

  async function renderUsers() {
    try {
      const users = await fetchData(`${API_BASE_URL}/users/all`);
      let html = `<h2 class="section-title" style="margin-bottom: 2rem;">User Management</h2>
                    <div class="list-container">`;

      users.forEach((user) => {
        html += `
                    <div class="card">
                        <h3>${user.username}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> <span style="color: ${user.role === "ADMIN" ? "var(--primary-light)" : "var(--text-secondary)"}">${user.role}</span></p>
                        <div class="card-actions">
                            ${
                              user.role !== "ADMIN"
                                ? `<button class="delete-user-btn" data-id="${user.id}">Delete User</button>`
                                : ""
                            }
                        </div>
                    </div>`;
      });
      html += `</div>`;
      mainContent.innerHTML = html;
      attachUserEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Error loading users: ${error.message}</p>`;
    }
  }

  async function renderBorrows() {
    try {
      const borrows = await fetchData(`${API_BASE_URL}/borrows/all`);
      let html = `<h2 class="section-title" style="margin-bottom: 2rem;">All Borrow Records</h2>
                    <div class="list-container">`;

      borrows.forEach((borrow) => {
        const isReturned = borrow.returnDate !== null;
        html += `
                    <div class="card">
                        <h3>Book: ${borrow.book ? borrow.book.title : "Deleted Book"}</h3>
                        <p><strong>User:</strong> ${borrow.user ? borrow.user.username : "Deleted User"}</p>
                        <p><strong>Borrowed:</strong> ${borrow.borrowDate}</p>
                        <p><strong>Due:</strong> ${borrow.dueDate}</p>
                        <p><strong>Returned:</strong> ${isReturned ? borrow.returnDate : "Not returned yet"}</p>
                        <p><strong>Penalty:</strong> $${borrow.penalty.toFixed(2)}</p>
                        <div class="card-actions">
                            <button class="delete-borrow-btn" data-id="${borrow.id}">Delete Record</button>
                        </div>
                    </div>`;
      });
      html += `</div>`;
      mainContent.innerHTML = html;
      attachBorrowEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Error loading borrow records: ${error.message}</p>`;
    }
  }

  async function renderMyBorrows() {
    try {
      const borrows = await fetchData(
        `${API_BASE_URL}/borrows/user/my-borrows`,
      );
      let html = `<h2 class="section-title" style="margin-bottom: 2rem;">My Borrowed Books</h2>
                    <div class="list-container">`;

      if (borrows.length === 0) {
        html += `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">You have no borrow records.</p>`;
      }

      borrows.forEach((borrow) => {
        const isReturned = borrow.returnDate !== null;
        const bookTitle = borrow.book ? borrow.book.title : "Deleted Book";
        const rentPerDay = borrow.book ? borrow.book.rentPerDay : 0;

        // Calculate estimated cost
        const days = calculateDaysBetween(borrow.borrowDate, borrow.dueDate);
        const estCost = (days * rentPerDay).toFixed(2);

        html += `
                    <div class="card">
                        <h3>${bookTitle}</h3>
                        <p><strong>Borrowed Date:</strong> ${borrow.borrowDate}</p>
                        <p><strong>Due Date:</strong> ${borrow.dueDate}</p>
                        <p><strong>Est. Cost:</strong> $${estCost}</p>
                        <p><strong>Status:</strong> ${isReturned ? `Returned on ${borrow.returnDate}` : "Currently Borrowed"}</p>
                        ${isReturned ? `<p><strong>Final Penalty:</strong> $${borrow.penalty.toFixed(2)}</p>` : ""}
                        <div class="card-actions">
                            ${!isReturned ? `<button class="return-btn" data-id="${borrow.id}">Return Book</button>` : ""}
                        </div>
                    </div>`;
      });
      html += `</div>`;
      mainContent.innerHTML = html;
      attachMyBorrowEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Error loading your borrows: ${error.message}</p>`;
    }
  }

  // Event Listeners for Modals
  document.querySelectorAll(".close-button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      toggleModal(modal, false);
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      toggleModal(e.target, false);
    }
  });

  document.getElementById("nav-login").addEventListener("click", () => {
    isRegisterMode = false;
    document.getElementById("auth-modal-title").textContent = "Login";
    authSubmitButton.textContent = "Login";
    toggleAuthModeBtn.textContent = "Need an account? Register";
    registerFields.style.display = "none";
    authForm.reset();
    toggleModal(authModal, true);
  });

  document.getElementById("nav-logout").addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    updateUIForRole();
    renderHome();
  });

  toggleAuthModeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    document.getElementById("auth-modal-title").textContent = isRegisterMode
      ? "Register"
      : "Login";
    authSubmitButton.textContent = isRegisterMode ? "Register" : "Login";
    toggleAuthModeBtn.textContent = isRegisterMode
      ? "Already have an account? Login"
      : "Need an account? Register";
    registerFields.style.display = isRegisterMode ? "block" : "none";
    authMessage.textContent = "";
  });

  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;
    const email = document.getElementById("auth-email").value;

    try {
      if (isRegisterMode) {
        await fetchData(`${API_BASE_URL}/users/register`, {
          method: "POST",
          body: JSON.stringify({ username, password, email, role: "USER" }),
        });
        authMessage.textContent =
          "Registration successful! You can now log in.";
        authMessage.style.color = "#28a745";

        setTimeout(() => {
          isRegisterMode = false;
          document.getElementById("auth-modal-title").textContent = "Login";
          authSubmitButton.textContent = "Login";
          toggleAuthModeBtn.textContent = "Need an account? Register";
          registerFields.style.display = "none";
          authForm.reset();
          authMessage.textContent = "";
        }, 1500);
      } else {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || response.statusText);
        }
        const data = await response.json();
        localStorage.setItem("jwtToken", data.token);
        toggleModal(authModal, false);
        updateUIForRole();
        renderBooks();
      }
    } catch (error) {
      authMessage.textContent = `Error: ${error.message}`;
      authMessage.style.color = "#f72585";
    }
  });

  // Main Nav Buttons
  document.getElementById("nav-discover").addEventListener("click", renderHome);
  document.getElementById("nav-books").addEventListener("click", renderBooks);
  document.getElementById("nav-users").addEventListener("click", renderUsers);
  document
    .getElementById("nav-borrows")
    .addEventListener("click", renderBorrows);
  document
    .getElementById("nav-my-borrows")
    .addEventListener("click", renderMyBorrows);

  // Book Form
  bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("book-id").value;
    const bookData = {
      title: document.getElementById("book-title").value,
      author: document.getElementById("book-author").value,
      category: document.getElementById("book-category").value,
      rentPerDay: Number.parseFloat(document.getElementById("book-rent").value),
      available: document.getElementById("book-available").checked,
    };
    try {
      if (id) {
        await fetchData(`${API_BASE_URL}/books/admin/${id}`, {
          method: "PUT",
          body: JSON.stringify(bookData),
        });
      } else {
        await fetchData(`${API_BASE_URL}/books/admin`, {
          method: "POST",
          body: JSON.stringify(bookData),
        });
      }
      toggleModal(bookModal, false);
      renderBooks();
    } catch (error) {
      document.getElementById("book-message").textContent =
        `Error: ${error.message}`;
    }
  });

  // Attach dynamic event listeners after rendering
  function attachBookEventListeners() {
    if (getUserRole() === "ADMIN") {
      document.getElementById("add-book-btn").addEventListener("click", () => {
        document.getElementById("book-modal-title").textContent =
          "Add New Book";
        document.getElementById("book-form").reset();
        document.getElementById("book-id").value = "";
        document.getElementById("book-available").checked = true; // default true
        document.getElementById("book-message").textContent = "";
        toggleModal(bookModal, true);
      });
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          const book = await fetchData(`${API_BASE_URL}/books/${id}`);
          document.getElementById("book-modal-title").textContent = "Edit Book";
          document.getElementById("book-id").value = book.id;
          document.getElementById("book-title").value = book.title;
          document.getElementById("book-author").value = book.author;
          document.getElementById("book-category").value = book.category;
          document.getElementById("book-rent").value = book.rentPerDay;
          document.getElementById("book-available").checked = book.available;
          document.getElementById("book-message").textContent = "";
          toggleModal(bookModal, true);
        });
      });
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this book?")) {
            try {
              await fetchData(`${API_BASE_URL}/books/admin/${id}`, {
                method: "DELETE",
              });
              renderBooks();
            } catch (error) {
              alert(`Error deleting book: ${error.message}`);
            }
          }
        });
      });
    }

    if (getUserRole() === "USER") {
      document.querySelectorAll(".borrow-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const bookId = e.target.dataset.id;
          const daysInput = document.getElementById(`days-${bookId}`);
          const borrowDays = daysInput ? daysInput.value : 14;

          try {
            const borrowedBook = await fetchData(
              `${API_BASE_URL}/borrows/user/borrow?bookId=${bookId}&days=${borrowDays}`,
              { method: "POST" },
            );
            alert(`Successfully borrowed! Due date: ${borrowedBook.dueDate}`);
            renderBooks();
          } catch (error) {
            alert(`Error borrowing book: ${error.message}`);
          }
        });
      });

      document.querySelectorAll(".days-input").forEach((input) => {
        input.addEventListener("input", (e) => {
          const bookId = e.target.id.split("-")[1];
          const days = e.target.value;
          const rentPerDay = Number.parseFloat(e.target.dataset.rent);
          const totalCost = (days * rentPerDay).toFixed(2);
          document.getElementById(`cost-${bookId}`).textContent =
            `$${totalCost}`;
        });
      });
    }
  }

  function attachUserEventListeners() {
    document.querySelectorAll(".delete-user-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this user?")) {
          try {
            await fetchData(`${API_BASE_URL}/users/admin/${id}`, {
              method: "DELETE",
            });
            renderUsers();
          } catch (error) {
            alert(`Error deleting user: ${error.message}`);
          }
        }
      });
    });
  }

  function attachBorrowEventListeners() {
    document.querySelectorAll(".delete-borrow-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const borrowId = e.target.dataset.id;
        if (
          confirm(
            "Are you sure you want to delete this borrow record? This will return the book to available status.",
          )
        ) {
          try {
            await fetchData(`${API_BASE_URL}/borrows/admin/${borrowId}`, {
              method: "DELETE",
            });
            renderBorrows();
          } catch (error) {
            alert(`Error deleting borrow record: ${error.message}`);
          }
        }
      });
    });
  }

  function attachMyBorrowEventListeners() {
    document.querySelectorAll(".return-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const borrowId = e.target.dataset.id;
        try {
          const returnedBorrow = await fetchData(
            `${API_BASE_URL}/borrows/user/return/${borrowId}`,
            { method: "POST" },
          );
          alert(
            `Successfully returned! Penalty: $${returnedBorrow.penalty.toFixed(2)}`,
          );
          renderMyBorrows();
        } catch (error) {
          alert(`Error returning book: ${error.message}`);
        }
      });
    });
  }

  // Initial page load
  updateUIForRole();
  renderHome(); // Explicitly render home so hero listeners attached

  function calculateDaysBetween(borrowDate, dueDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(borrowDate);
    const secondDate = new Date(dueDate);
    const diffDays = Math.round(Math.abs((secondDate - firstDate) / oneDay));
    return diffDays;
  }
});
