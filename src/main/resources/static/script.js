document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:8080/api";
  const AUTH_BASE_URL = "http://localhost:8080/auth";

  const mainContent = document.getElementById("main-content");
  const navButtons = document.querySelectorAll(".nav-button");
  const authModal = document.getElementById("auth-modal");
  const bookModal = document.getElementById("book-modal");
  const closeButtons = document.querySelectorAll(".close-button");
  const authForm = document.getElementById("auth-form");
  const bookForm = document.getElementById("book-form");
  const toggleAuthModeBtn = document.getElementById("toggle-auth-mode");
  const registerFields = document.getElementById("register-fields");
  const authSubmitButton = document.getElementById("auth-submit-button");
  const authMessage = document.getElementById("auth-message");
  const welcomeMessage = document.getElementById("welcome-message");

  let isRegisterMode = false;

  // --- Authentication and UI State Management ---

  function getAuthToken() {
    return localStorage.getItem("jwtToken");
  }

  function getUserRole() {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role;
    } catch (e) {
      console.error("Failed to parse token:", e);
      return null;
    }
  }

  function getUserId() {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch (e) {
      console.error("Failed to parse token:", e);
      return null;
    }
  }

  function getHeaders() {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  function updateUIForRole() {
    const role = getUserRole();
    const isLoggedIn = !!role;

    document.getElementById("nav-login").style.display = isLoggedIn
      ? "none"
      : "block";
    document.getElementById("nav-logout").style.display = isLoggedIn
      ? "block"
      : "none";
    welcomeMessage.style.display = isLoggedIn ? "inline-block" : "none";

    if (isLoggedIn) {
      welcomeMessage.textContent = `Welcome, ${getUserId()}!`;
    }

    document.querySelectorAll(".admin-only").forEach((el) => {
      el.style.display = role === "ADMIN" ? "block" : "none";
    });

    document.querySelectorAll(".user-only").forEach((el) => {
      el.style.display = role === "USER" ? "block" : "none";
    });
  }

  // --- Modal Functions ---

  function toggleModal(modal, show) {
    if (show) {
      modal.classList.add("show");
    } else {
      modal.classList.remove("show");
      authMessage.textContent = "";
      document.getElementById("book-message").textContent = "";
    }
  }

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      toggleModal(e.target.closest(".modal"), false);
    });
  });

  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      toggleModal(event.target, false);
    }
  });

  // --- API Calls ---

  async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...getHeaders(), ...options.headers },
      });

      // If the request was successful but has no content, just return.
      if (
        response.status === 204 ||
        response.headers.get("Content-Length") === "0"
      ) {
        return null; // Or return undefined
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText);
      }

      // Corrected: Only attempt to parse JSON if the response is not empty
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  // --- Dynamic Content Rendering ---

  function renderHome() {
    mainContent.innerHTML = `
      <section class="hero-section">
        <div class="hero-content">
          <h2 class="hero-title">Discover Your Next Great Read</h2>
          <p class="hero-subtitle">Join our community of book lovers and explore thousands of titles</p>
          
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">📖</div>
              <h3>Expand Your Mind</h3>
              <p>Reading enhances knowledge, improves focus, and opens new perspectives on the world.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">🧠</div>
              <h3>Boost Creativity</h3>
              <p>Stories inspire imagination and help you think in new ways, unlocking creative potential.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">😌</div>
              <h3>Reduce Stress</h3>
              <p>Immerse yourself in captivating narratives and find peace in the world of books.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">🌍</div>
              <h3>Connect Globally</h3>
              <p>Explore diverse cultures and perspectives through literature from around the world.</p>
            </div>
          </div>

          <button id="hero-login-btn" class="hero-cta-button">Start Reading Today</button>
        </div>

        <div class="hero-animations">
          <div class="books-container">
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
    // Reattach the hero login button listener
    const heroLoginBtn = document.getElementById("hero-login-btn");
    if (heroLoginBtn) {
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

  async function renderBooks() {
    try {
      const books = await fetchData(`${API_BASE_URL}/books`);
      const isAdmin = getUserRole() === "ADMIN";

      let bookListHtml = "";
      books.forEach((book) => {
        bookListHtml += `
                    <div class="card">
                        <h3>${book.title}</h3>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category}</p>
                        <p><strong>Rent:</strong> $${book.rentPerDay} / day</p>
                        <p><strong>Available:</strong> ${
                          book.available ? "✅ Yes" : "❌ No"
                        }</p>
                        <div class="card-actions">
                            ${
                              isAdmin
                                ? `
                                <button class="edit-btn" data-id="${book.id}">Edit</button>
                                <button class="delete-btn" data-id="${book.id}">Delete</button>
                            `
                                : ""
                            }
                            ${
                              !isAdmin && book.available
                                ? `
                                <div class="borrow-controls">
                                    <label for="days-${book.id}">Days:</label>
                                    <input type="number" id="days-${
                                      book.id
                                    }" class="days-input" data-rent="${
                                    book.rentPerDay
                                  }" value="14" min="1" max="30">
                                    <p>Total Cost: <span id="cost-${
                                      book.id
                                    }">$${(book.rentPerDay * 14).toFixed(
                                    2
                                  )}</span></p>
                                    <button class="borrow-btn" data-id="${
                                      book.id
                                    }">Borrow</button>
                                </div>
                            `
                                : ""
                            }
                        </div>
                    </div>
                `;
      });

      mainContent.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">Books</h2>
                    ${
                      isAdmin
                        ? `<button id="add-book-btn" class="action-button">Add New Book</button>`
                        : ""
                    }
                </div>
                <div class="list-container book-list">${bookListHtml}</div>
            `;
      attachBookEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Failed to load books: ${error.message}</p>`;
    }
  }

  async function renderUsers() {
    try {
      const users = await fetchData(`${API_BASE_URL}/users/all`);
      let userListHtml = "";
      users.forEach((user) => {
        userListHtml += `
                    <div class="card">
                        <h3>${user.username}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        <div class="card-actions">
                            <button class="delete-user-btn" data-id="${user.id}">Delete</button>
                        </div>
                    </div>
                `;
      });
      mainContent.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">Users</h2>
                </div>
                <div class="list-container user-list">${userListHtml}</div>
            `;
      attachUserEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Failed to load users: ${error.message}</p>`;
    }
  }

  async function renderBorrows() {
    try {
      const borrows = await fetchData(`${API_BASE_URL}/borrows/all`);
      let borrowListHtml = "";
      borrows.forEach((borrow) => {
        const daysBorrowed = calculateDaysBetween(
          borrow.borrowDate,
          borrow.dueDate
        );
        const totalAmountToGive = (
          daysBorrowed * borrow.book.rentPerDay
        ).toFixed(2);
        const totalAmountPaid = borrow.returnDate
          ? (Number.parseFloat(totalAmountToGive) + borrow.penalty).toFixed(2)
          : "N/A";

        borrowListHtml += `
                    <div class="card">
                        <h3>${borrow.book.title}</h3>
                        <p><strong>Borrowed by:</strong> ${
                          borrow.user.username
                        }</p>
                        <p><strong>Borrow Date:</strong> ${
                          borrow.borrowDate
                        }</p>
                        <p><strong>Due Date:</strong> ${borrow.dueDate}</p>
                        <p><strong>Return Date:</strong> ${
                          borrow.returnDate || "N/A"
                        }</p>
                        <p><strong>Days Borrowed:</strong> ${daysBorrowed}</p>
                        <p><strong>Total Amount to Give:</strong> $${totalAmountToGive}</p>
                        <p><strong>Penalty:</strong> $${borrow.penalty.toFixed(
                          2
                        )}</p>
                        <p><strong>Total Amount Paid:</strong> ${
                          totalAmountPaid === "N/A"
                            ? "N/A"
                            : "$" + totalAmountPaid
                        }</p>
                        <div class="card-actions">
                            <button class="delete-borrow-btn" data-id="${
                              borrow.id
                            }">Delete</button>
                        </div>
                    </div>
                `;
      });
      mainContent.innerHTML = `
                <div class="section-header">
                    <h2 class="section-title">All Borrows</h2>
                </div>
                <div class="list-container borrow-list">${borrowListHtml}</div>
            `;
      attachBorrowEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Failed to load borrows: ${error.message}</p>`;
    }
  }

  async function renderMyBorrows() {
    try {
      const borrows = await fetchData(
        `${API_BASE_URL}/borrows/user/my-borrows`
      );

      let borrowListHtml = "";
      borrows.forEach((borrow) => {
        const daysBorrowed = calculateDaysBetween(
          borrow.borrowDate,
          borrow.dueDate
        );
        const totalAmountToGive = (
          daysBorrowed * borrow.book.rentPerDay
        ).toFixed(2);
        const totalAmountPaid = borrow.returnDate
          ? (Number.parseFloat(totalAmountToGive) + borrow.penalty).toFixed(2)
          : "N/A";

        borrowListHtml += `
                <div class="card">
                    <h3>${borrow.book.title}</h3>
                    <p><strong>Borrow Date:</strong> ${borrow.borrowDate}</p>
                    <p><strong>Due Date:</strong> ${borrow.dueDate}</p>
                    <p><strong>Status:</strong> ${
                      borrow.returnDate ? "Returned" : "Outstanding"
                    }</p>
                    <p><strong>Days Borrowed:</strong> ${daysBorrowed}</p>
                    <p><strong>Total Amount to Give:</strong> $${totalAmountToGive}</p>
                    <p><strong>Penalty:</strong> $${borrow.penalty.toFixed(
                      2
                    )}</p>
                    <p><strong>Total Amount Paid:</strong> ${
                      totalAmountPaid === "N/A" ? "N/A" : "$" + totalAmountPaid
                    }</p>
                    <div class="card-actions">
                        ${
                          !borrow.returnDate
                            ? `<button class="return-btn" data-id="${borrow.id}">Return Book</button>`
                            : ""
                        }
                    </div>
                </div>
            `;
      });
      mainContent.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">My Borrowed Books</h2>
            </div>
            <div class="list-container borrow-list">${borrowListHtml}</div>
        `;
      attachMyBorrowEventListeners();
    } catch (error) {
      mainContent.innerHTML = `<p class="error-message">Failed to load your borrows: ${error.message}</p>`;
    }
  }

  // --- Event Listeners ---

  // Auth Modal
  document.getElementById("nav-login").addEventListener("click", () => {
    isRegisterMode = false;
    document.getElementById("auth-modal-title").textContent = "Login";
    authSubmitButton.textContent = "Login";
    toggleAuthModeBtn.textContent = "Need an account? Register";
    registerFields.style.display = "none";
    authForm.reset();
    toggleModal(authModal, true);
  });

  const heroLoginBtn = document.getElementById("hero-login-btn");
  if (heroLoginBtn) {
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
        isRegisterMode = false; // Switch back to login mode after registration
        document.getElementById("auth-modal-title").textContent = "Login";
        authSubmitButton.textContent = "Login";
        toggleAuthModeBtn.textContent = "Need an account? Register";
        registerFields.style.display = "none";
        authForm.reset();
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
      document.getElementById(
        "book-message"
      ).textContent = `Error: ${error.message}`;
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
              { method: "POST" }
            );
            alert(
              `Successfully borrowed "${borrowedBook.book.title}"! Due date: ${borrowedBook.dueDate}`
            );
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
          document.getElementById(
            `cost-${bookId}`
          ).textContent = `$${totalCost}`;
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
            "Are you sure you want to delete this borrow record? This will return the book to available status."
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
            { method: "POST" }
          );
          alert(
            `Successfully returned "${
              returnedBorrow.book.title
            }". Penalty: $${returnedBorrow.penalty.toFixed(2)}`
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
  if (getAuthToken()) {
    renderBooks();
  }

  // Declare the calculateDaysBetween function
  function calculateDaysBetween(borrowDate, dueDate) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(borrowDate);
    const secondDate = new Date(dueDate);
    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    return diffDays;
  }
});
