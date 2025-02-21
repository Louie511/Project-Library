localStorage.removeItem("myLibrary");

window.addEventListener("load", () => {
    const savedLibrary = localStorage.getItem("myLibrary");

    if (savedLibrary) {
        myLibrary = JSON.parse(savedLibrary)
    }
});

// document.addEventListener("DOMContentLoaded", function (){
//     const books = document.querySelectorAll(".book img");

//     books.forEach((book) => {
//         book.src = book.src = `https://picsum.photos/500/800?random=${Math.floor(Math.random() * 1000)}`;
//     });
// });


// THEME TOGGLE BUTTON

document.getElementById("theme-toggle").addEventListener("change", function (){
    document.body.classList.toggle("dark-theme")
})

// BOOKS

let currentBookIndex = 0;

let myLibrary = [
    new Book("The Horus Heresy", "False Gods", "Graham McNeill", "416", false),
    new Book("", "The Subtle Art of Not Giving a F*ck", "Mark Manson", "256", true),
    new Book ("The Lord of the rings", "The Lord of the rings", "J.R.R Tolkien", "1137", false),
    new Book ("", "I am Ozzy", "Ozzy Osbourne", "223", false),
    new Book ("", "The Dirt", "Neil Strauss", "464", true),
    new Book ("The Witcher", "The Last Wish", "Andrzej Sapkowski", "384", "false"),
    new Book ("Cyberpunk 2077", "Cyberpunk 2077", "", "104", false)
];


function Book(series, title, author, pages, read) {
    this.series = series; 
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
};

function addBookToLibrary(){

    const series = document.querySelector("#series").value;
    const title = document.querySelector("#title").value;
    const author = document.querySelector("#author").value;
    const pages = document.querySelector("#pages").value;
    const read = document.querySelector("#read").checked;


    const book = new Book(series, title, author, pages, read);
    myLibrary.push(book);


    fetchBookCover(book, 2);
}


// BOOK COVER API

let coverCache = {};

function fetchBookCover(book, index) {
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

const submitBtn = document.querySelector(`button[type="submit"]`);

submitBtn.addEventListener("click", (event) =>{
    event.preventDefault();
    addBookToLibrary();
    fetchBookCover();
    localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
    document.querySelector("#book-form").reset();
})


document.addEventListener("DOMContentLoaded", function (){
    const listBooks = document.querySelector(".list-view");

    function listView(){

    }
});