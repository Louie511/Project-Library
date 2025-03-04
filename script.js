window.addEventListener("load", () => {
    const savedLibrary = localStorage.getItem("myLibrary");

    if (savedLibrary) {
        myLibrary = JSON.parse(savedLibrary).map(bookData => {
            const book = new Book(bookData.series, bookData.title, bookData.author, bookData.pages, bookData.read);
            if (bookData.cover) {
                coverCache[book.title] = bookData.cover;
            }
            return book;
        })
    }
    if (typeof renderBooks === "function") {
        renderBooks();
    } else {
        console.error("renderBooks is not defined.");
    }
});

// THEME TOGGLE BUTTON

document.getElementById("theme-toggle").addEventListener("change", function (){
    document.body.classList.toggle("dark-theme")
})

// BOOK CONSTRUCTOR

function Book(series, title, author, pages, read) {
    this.series = series; 
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
};


let currentBookIndex = 0;

let myLibrary = [
    new Book("The Horus Heresy", "False Gods", "Graham McNeill", "416", false),
    new Book("", "The Subtle Art of Not Giving a F*ck", "Mark Manson", "256", true),
    new Book ("The Lord of the rings", "The Lord of the rings", "J.R.R Tolkien", "1137", false),
    new Book ("", "I am Ozzy", "Ozzy Osbourne", "223", false),
    new Book ("", "The Dirt", "Neil Strauss", "464", true),
    new Book ("The Witcher", "The Last Wish", "Andrzej Sapkowski", "384", false),
    new Book ("Cyberpunk 2077", "Cyberpunk 2077", "", "104", false)
];

// SAVE THE LIBRARY TO LOCAL STORAGE

function saveLibrary() {
    const libraryWithCovers = myLibrary.map(book => ({
        ...book,
        cover: coverCache[book.title] || ""
    }));
    localStorage.setItem("myLibrary", JSON.stringify(libraryWithCovers));
}

// ADD BOOK TO LIBRARY FUNC

function addBookToLibrary(){

    const series = document.querySelector("#series").value;
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = document.querySelector("#pages").value;
    const read = document.querySelector("#read").checked;


    const book = new Book(series, title, author, pages, read);
    myLibrary.push(book);

    saveLibrary();
    fetchBookCover(book, 2);

    const bookList = document.querySelector(".popup-library-container");
    if (window.getComputedStyle(bookList).display !== "none") {
        addLoadingPlaceholder();
    }
}

// CYCLE BOOKS

document.addEventListener("DOMContentLoaded", function (){


    function cycleBooks() {
        const leftArrow = document.querySelector("button.arrow.left");
        const rightArrow = document.querySelector("button.arrow.right");
        
    
        leftArrow.addEventListener("click", () =>{
            if (currentBookIndex > 0) {
                currentBookIndex--;
            } else {
                currentBookIndex = myLibrary.length -1;
            }
            renderBooks()
        });

        rightArrow.addEventListener("click", () =>{
            if (currentBookIndex < myLibrary.length -1){
                currentBookIndex++;
            } else {
                currentBookIndex = 0;
            }
            renderBooks()
        });
    }

    function renderBooks(){
        const bookContainers = document.querySelectorAll(".books .book");

        bookContainers.forEach((book, index) =>{
            const bookIndex = (currentBookIndex + index - 2 + myLibrary.length) % myLibrary.length;
            fetchBookCover(myLibrary[bookIndex], index);

            if (bookIndex === currentBookIndex) {
                book.classList.add("focus");
            }else {
                book.classList.remove("focus");
            }
        });
    }
    

    cycleBooks();
    renderBooks();
});


// BOOK COVER API

let coverCache = {};

function fetchBookCover(book, index) {
    if (!book || !book.title) {
        console.warn(`Warning: Book title is missing or undefined at index ${index}`, book);
        return;
    }

    const bookContainers = document.querySelectorAll(".books .book");


    if (coverCache[book.title]) {
        const bookImg = bookContainers[index].querySelector("img");
        const reflection = bookContainers[index].querySelector(".reflection");

        bookImg.src = coverCache[book.title];
        reflection.src = coverCache[book.title];
    } else {
        const apiUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(book.title)}&limit=1`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.docs && data.docs.length > 0) {
                    const coverId = data.docs[0].cover_i;
                    const coverImageUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;

                    coverCache[book.title] = coverImageUrl;

                    const bookImg = bookContainers[index].querySelector("img");
                    let reflection = bookContainers[index].querySelector(".reflection");

                    if (!reflection) {
                        reflection = document.createElement("img");
                        reflection.classList.add("reflection");
                        bookContainers[index].appendChild(reflection);
                    }

                    bookImg.src = coverImageUrl;
                    reflection.src = coverImageUrl;
                } else {
                    console.log("No book cover found");
                }
            })
            .catch(error => {
                console.error("Error fetching cover:", error);
            });
    }
}


// POPUP FORM 


const addBooksBtn = document.querySelector(".add-book");
const popupContainer = document.querySelector(".popup-form-container");
const mainContainer = document.querySelector("main");

addBooksBtn.addEventListener("click", () => {
    if (popupContainer.style.display !== "flex") {
        popupContainer.style.display = "flex";
    } else {
        popupContainer.style.display = "none";
    }
});

window.addEventListener("click", (clickEvent) => {
    if (clickEvent.target === mainContainer) {
        popupContainer.style.display = "none"
    }
});


document.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.key === "Escape") {
        popupContainer.style.display = "none";
    };
});

const submitBtn = document.querySelector("#book-form button[type='submit']");

document.addEventListener("DOMContentLoaded", function () {

    const bookForm = document.querySelector("#book-form");

    bookForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = document.querySelector("#title").value;

        const bookExists = myLibrary.some (
            (book) => book.title.toLowerCase() === title.toLowerCase()
        );

        if (bookExists) {
            alert("This book already exists in your Library");
            return;
        }

        addBookToLibrary();

        bookForm.reset();
        popupContainer.style.display = "none";
    });
});

// PLACEHOLDER FOR BOOK COVER

function addLoadingPlaceholder() {
    const libraryGrid = document.querySelector("#library-grid");
    const loadingDiv = document.createElement("div");

    loadingDiv.classList.add("library-book-cover", "loading");

    loadingDiv.innerHTML = `<div class="spinner"></div>`;
    libraryGrid.appendChild(loadingDiv);
}

// LIBRARY GRID VIEW

document.addEventListener("DOMContentLoaded", function () {
    const listBooks = document.querySelector(".list-view");
    const bookList = document.querySelector(".popup-library-container");
    const libraryGrid = document.querySelector("#library-grid");
    const carousel = document.querySelector(".carousel-container");

    listBooks.addEventListener("click", async () => {
        const isBookListVisible = window.getComputedStyle(bookList).display !== "none";

        bookList.style.display = isBookListVisible ? "none" : "block";
        libraryGrid.innerHTML = "";

        carousel.style.visibility = isBookListVisible ? "visible" : "hidden";

        for (let book of myLibrary) {
            if (!book.title) continue;

            const bookCover = document.createElement("div");
            bookCover.classList.add("library-book-cover", "loading");
            libraryGrid.appendChild(bookCover);

            try {
                
                if (!coverCache[book.title]) {
                    await fetchBookCover(book, myLibrary.indexOf(book));
                }

                const coverUrl = coverCache[book.title] || "default-placeholder.png";

                
                const img = new Image();
                img.src = coverUrl;
                img.onload = () => {
                    bookCover.style.backgroundImage = `url('${coverUrl}')`;
                    bookCover.classList.remove("loading");
                };
            } catch (error) {
                console.error("Failed to load book cover:", error);
            }
        }
    });
});

// CLICK BOOK

document.addEventListener("click", function (event) {
    const clickedBook = event.target.closest("#library-grid .library-book-cover"); 

    if (clickedBook) {
        const bookIndex = Array.from(document.querySelectorAll("#library-grid .library-book-cover")).indexOf(clickedBook);
        
        if (clickedBook.classList.contains("selected")) {
            clickedBook.classList.remove("selected");
            const detailsContainer = clickedBook.querySelector(".book-info");
            if (detailsContainer) detailsContainer.remove();
        } else {
            document.querySelectorAll("#library-grid .library-book-cover").forEach(book => {
                book.classList.remove("selected");
                const info = book.querySelector(".book-info");
                if (info) info.remove();
            });

            clickedBook.classList.add("selected");
            displayBookDetails(bookIndex, clickedBook);
        }
    }
});

// DISPLAY BOOK INFO INSIDE THE SELECTED BOOK
function displayBookDetails(bookIndex, bookElement) {
    if (!Array.isArray(myLibrary) || bookIndex < 0 || bookIndex >= myLibrary.length) return;

    const book = myLibrary[bookIndex];
    if (!book) return;

    let detailsContainer = document.createElement("div");
    detailsContainer.classList.add("book-info");

    detailsContainer.innerHTML = `
        <h2>${book.title}</h2>
        <p><strong>Series:</strong> ${book.series || "N/A"}</p>
        <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
        <p><strong>Pages:</strong> ${book.pages}</p>
        <p><strong>Read:</strong> ${book.read ? "Yes" : "No"}</p>
        <button class="remove-book-btn">Remove Book</button>
    `;

    bookElement.appendChild(detailsContainer);

    detailsContainer.querySelector(".remove-book-btn").addEventListener("click", function (event) {
        event.stopPropagation();
        removeBook(bookIndex);
    });
}

function removeBook(index) {
    if (index < 0 || index >= myLibrary.length) return;
    myLibrary.splice(index, 1);
    localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
    document.querySelectorAll(".library-book-cover")[index]?.remove();
    updateBookIndices();
}

// FUNCTION TO UPDATE DATA-INDEX AFTER REMOVAL
function updateBookIndices() {
    document.querySelectorAll(".library-book-cover").forEach((book, newIndex) => {
        book.dataset.index = newIndex; 
        book.querySelector(".remove-book-btn").onclick = () => removeBook(newIndex); 
    });
}





