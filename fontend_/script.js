// === CONFIG ===
const API_BASE_URL = "http://localhost:5159/api/books";


async function loadBooks() {
    const response = await fetch(API_BASE_URL);
    const books = await response.json();
    displayBooks(books);
}

// === MODAL HANDLING ===
const openBtn = document.querySelector(".add_book_button");
const closeBtn = document.querySelector(".cancel_button");
const model = document.querySelector(".model");
const overlay = document.getElementById("overlay");

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
});

function openModal() {
    overlay.style.display = "block";
    model.style.display = "block";
}

function closeModal() {
    overlay.style.display = "none";
    model.style.display = "none";
    document.querySelector(".form").reset();
}

// === FORM ELEMENTS ===
const addToList = document.getElementById("add_book_to_list");
const bookTitle = document.getElementById("book_title");
const bookAuthor = document.getElementById("book_author");
const coverImage = document.getElementById("cover_image");
const categoryInput = document.getElementById("category_input");
const statusRadios = document.getElementsByName("status");

// filters
const statusButtons = document.querySelectorAll(".status_button");
const categoryDropdown = document.getElementById("category_dropdown");
const bookList = document.getElementById("book_list");

// counters
const totalCounter = document.getElementById("total_book_count");
const toReadCounter = document.getElementById("to-read_count");
const readCounter = document.getElementById("read_count");

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
    loadBooks();
    setupFilterEvents();
});

addToList.addEventListener("click", async (event) => {
    event.preventDefault();
    await addBook();
});

// === API CALLS ===
async function loadBooks() {
    const res = await fetch(API_BASE_URL);
    books = await res.json();
    renderBooks();
    updateCounters();
    populateCategoryDropdown();
}

async function addBook() {
    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    const image = coverImage.value.trim();
    const category = categoryInput.value.trim();

    if (!title || !author || !category) {
        alert("Title, author and category are required.");
        return;
    }

    let statusValue = "";
    for (let i = 0; i < statusRadios.length; i++) {
        if (statusRadios[i].checked) {
            statusValue = statusRadios[i].value;
            break;
        }
    }
    if (!statusValue) {
        alert("Select a status.");
        return;
    }

    // map form values to backend status string
    const status =
        statusValue === "already_read_choice" ? "Read" : "ToRead";

    const payload = {
        title,
        author,
        coverImageUrl: image || null,
        category,
        status,
    };

    const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        alert("Error saving book.");
        return;
    }

    const created = await res.json();
    books.push(created);
    renderBooks();
    updateCounters();
    populateCategoryDropdown();
    closeModal();
}

async function deleteBook(id) {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        alert("Error deleting book.");
        return;
    }
    books = books.filter((b) => b.id !== id);
    renderBooks();
    updateCounters();
    populateCategoryDropdown();
}

async function markBookAsRead(id) {
    const res = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Read" }),
    });

    if (!res.ok) {
        alert("Error updating book.");
        return;
    }

    const updated = await res.json();
    books = books.map((b) => (b.id === id ? updated : b));
    renderBooks();
    updateCounters();
}

// === RENDERING ===
function renderBooks() {
    bookList.innerHTML = "";

    const statusFilter = document.querySelector(".status_button.active")
        ?.dataset.status || "all";

    const categoryFilter = categoryDropdown.value || "all_categories";

    const filtered = books.filter((b) => {
        let statusOk = true;
        if (statusFilter === "read") statusOk = b.status === "Read";
        else if (statusFilter === "to_read") statusOk = b.status === "ToRead";

        let categoryOk = true;
        if (categoryFilter !== "all_categories")
            categoryOk = b.category === categoryFilter;

        return statusOk && categoryOk;
    });

    filtered.forEach((book) => {
        const card = createBookCard(book);
        bookList.appendChild(card);
    });
}

function createBookCard(book) {
    const card = document.createElement("div");
    card.classList.add("book_card");
    card.dataset.id = book.id;

    // header
    const header = document.createElement("div");
    header.classList.add("book_card-header");

    const categorySpan = document.createElement("span");
    categorySpan.classList.add("book_card-category-label");
    categorySpan.textContent = `Category`;

    const deleteSpan = document.createElement("span");
    deleteSpan.classList.add("book_card-delete");
    deleteSpan.textContent = "Delete";
    deleteSpan.addEventListener("click", () => deleteBook(book.id));

    header.appendChild(categorySpan);
    header.appendChild(deleteSpan);

    // middle: title + author
    const titleEl = document.createElement("h3");
    titleEl.classList.add("book_card-title");
    titleEl.textContent = book.title;

    const authorEl = document.createElement("p");
    authorEl.classList.add("book_card-author");
    authorEl.textContent = book.author;

    // footer: mark as read
    const footer = document.createElement("div");
    footer.classList.add("book_card-footer");

    const radio = document.createElement("span");
    radio.classList.add("book_card-radio");
    if (book.status === "Read") {
        radio.classList.add("book_card-radio--active");
    }

    const markLabel = document.createElement("span");
    markLabel.classList.add("book_card-mark-label");
    markLabel.textContent = "*Mark as read*";

    const clickHandler = () => {
        if (book.status === "Read") return;
        markBookAsRead(book.id);
    };

    radio.addEventListener("click", clickHandler);
    markLabel.addEventListener("click", clickHandler);

    footer.appendChild(radio);
    footer.appendChild(markLabel);

    // assemble
    card.appendChild(header);
    card.appendChild(titleEl);
    card.appendChild(authorEl);
    footer.style.marginTop = "16px";
    card.appendChild(footer);

    return card;
}

// === COUNTERS ===
function updateCounters() {
    const total = books.length;
    const read = books.filter((b) => b.status === "Read").length;
    const toRead = books.filter((b) => b.status === "ToRead").length;

    totalCounter.textContent = total;
    readCounter.textContent = read;
    toReadCounter.textContent = toRead;
}

// === FILTERS ===
function setupFilterEvents() {
    statusButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            statusButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const label = btn.textContent.trim().toLowerCase();
            if (label === "read") btn.dataset.status = "read";
            else if (label === "to read") btn.dataset.status = "to_read";
            else btn.dataset.status = "all";

            renderBooks();
        });
    });

    // default: All active
    statusButtons[0].classList.add("active");
    statusButtons[0].dataset.status = "all";

    categoryDropdown.addEventListener("change", renderBooks);
}

function populateCategoryDropdown() {
    const allCategories = new Set();
    books.forEach((b) => allCategories.add(b.category));

    const currentValue = categoryDropdown.value;

    // reset
    categoryDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "all_categories";
    defaultOption.textContent = "All Categories";
    categoryDropdown.appendChild(defaultOption);

    allCategories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categoryDropdown.appendChild(opt);
    });

    if (currentValue) categoryDropdown.value = currentValue;
}
