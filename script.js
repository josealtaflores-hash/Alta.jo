/*
Replace these with your real links.
*/
const instagramUrl = "https://www.instagram.com/alta.jo/";
const purchaseUrl = "https://YOUR-BOOK-PURCHASE-LINK.com/";
/*
Keep every spread from your current site in this array.
The popup appears when the visitor presses Next after the final spread.
*/
const spreads = [
    {
        left: "images/001.jpg",
        right: "images/002.jpg"
    },
    {
        left: "images/003.jpg",
        right: "images/004.jpg"
    },
    {
        left: "images/005.jpg",
        right: "images/006.jpg"
    },
    {
        left: "images/007.jpg",
        right: "images/008.jpg"
    },
    {
        left: "images/009.jpg",
        right: "images/0010.jpg"
    },
    {
        left: "images/0011.jpg",
        right: "images/0012.jpg"
    },
    {
        left: "images/0013.jpg",
        right: "images/0014.jpg"
    },
    {
        left: "images/0015.jpg",
        right: "images/0016.jpg"
    },
    {
        left: "images/0017.jpg",
        right: "images/0018.jpg"
    },
    {
        left: "images/0019.jpg",
        right: "images/0020.jpg"
    },
    {
        left: "images/0021.jpg",
        right: "images/0022.jpg"
    }
];

const book = document.getElementById("book");
const leftPageImage = document.getElementById("left-page-image");
const rightPageImage = document.getElementById("right-page-image");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const pageNumber = document.getElementById("page-number");

const endPopup = document.getElementById("end-popup");
const popupClose = document.getElementById("popup-close");
const restartBook = document.getElementById("restart-book");
const instagramLink = document.getElementById("instagram-link");
const purchaseLink = document.getElementById("purchase-link");

let currentSpread = 0;
let popupTimer;

instagramLink.href = instagramUrl;
purchaseLink.href = purchaseUrl;

function preloadSpread(index) {
    if (index < 0 || index >= spreads.length) return;

    const leftImage = new Image();
    const rightImage = new Image();

    leftImage.src = spreads[index].left;
    rightImage.src = spreads[index].right;
}

function updateBook() {
    const spread = spreads[currentSpread];

    leftPageImage.src = spread.left;
    rightPageImage.src = spread.right;

    const leftPageNumber = currentSpread * 2 + 1;
    const rightPageNumber = leftPageNumber + 1;

    pageNumber.textContent = `${leftPageNumber}–${rightPageNumber}`;

    previousButton.disabled = currentSpread === 0;

    preloadSpread(currentSpread + 1);
    preloadSpread(currentSpread - 1);
}

function showEndPopup() {
    window.clearTimeout(popupTimer);

    book.classList.add("is-ending");

    popupTimer = window.setTimeout(() => {
        endPopup.classList.add("is-visible");
        endPopup.setAttribute("aria-hidden", "false");
        document.body.classList.add("popup-open");
        popupClose.focus();
    }, 350);
}

function hideEndPopup() {
    window.clearTimeout(popupTimer);

    endPopup.classList.remove("is-visible");
    endPopup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("popup-open");
    book.classList.remove("is-ending");
    nextButton.focus();
}

function restartFromBeginning() {
    currentSpread = 0;
    updateBook();
    hideEndPopup();
}

previousButton.addEventListener("click", () => {
    if (currentSpread > 0) {
        currentSpread -= 1;
        updateBook();
    }
});

nextButton.addEventListener("click", () => {
    const isLastSpread = currentSpread === spreads.length - 1;

    if (isLastSpread) {
        showEndPopup();
        return;
    }

    currentSpread += 1;
    updateBook();
});

popupClose.addEventListener("click", hideEndPopup);
restartBook.addEventListener("click", restartFromBeginning);

endPopup.addEventListener("click", (event) => {
    if (event.target === endPopup) {
        hideEndPopup();
    }
});

document.addEventListener("keydown", (event) => {
    const popupIsVisible = endPopup.classList.contains("is-visible");

    if (event.key === "Escape" && popupIsVisible) {
        hideEndPopup();
        return;
    }

    if (popupIsVisible) return;

    if (event.key === "ArrowLeft") previousButton.click();
    if (event.key === "ArrowRight") nextButton.click();
});

updateBook();
