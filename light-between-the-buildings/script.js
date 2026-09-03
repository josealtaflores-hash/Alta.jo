/*
Change this to however many PREVIEW pages you want to show.
Keep the image filenames sequential:
001.jpg, 002.jpg, 003.jpg, etc.
*/
const TOTAL_PAGES = 14;

const instagramUrl = "https://www.instagram.com/alta.jo/";
const purchaseUrl = "https://YOUR-BOOK-PURCHASE-LINK.com/";

function pageFile(number) {
    if (number <= 15) {
        return `images/00${number}.jpg`;
    }

    return `images/${String(number).padStart(4, "0")}.jpg`;
}

const spreads = [];

for (let page = 1; page <= TOTAL_PAGES; page += 2) {
    spreads.push({
        left: pageFile(page),
        right:
            page + 1 <= TOTAL_PAGES
                ? pageFile(page + 1)
                : null
    });
}

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

    const spread = spreads[index];

    if (spread.left) {
        const leftImage = new Image();
        leftImage.src = spread.left;
    }

    if (spread.right) {
        const rightImage = new Image();
        rightImage.src = spread.right;
    }
}

function updateBook() {
    const spread = spreads[currentSpread];

    leftPageImage.src = spread.left;

    if (spread.right) {
        rightPageImage.src = spread.right;
        rightPageImage.style.visibility = "visible";
    } else {
        rightPageImage.removeAttribute("src");
        rightPageImage.style.visibility = "hidden";
    }

    const leftPageNumber = currentSpread * 2 + 1;
    const rightPageNumber = Math.min(leftPageNumber + 1, TOTAL_PAGES);

    pageNumber.textContent =
        leftPageNumber === rightPageNumber
            ? `${leftPageNumber}`
            : `${leftPageNumber}–${rightPageNumber}`;

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

function goToPreviousSpread() {
    if (currentSpread > 0) {
        currentSpread -= 1;
        updateBook();
    }
}

function goToNextSpread() {
    const isLastSpread = currentSpread === spreads.length - 1;

    if (isLastSpread) {
        showEndPopup();
        return;
    }

    currentSpread += 1;
    updateBook();
}

/* Swipe support */
let touchStartX = 0;
let touchStartY = 0;

const minimumSwipeDistance = 50;
const maximumVerticalMovement = 80;

book.addEventListener(
    "touchstart",
    (event) => {
        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    },
    { passive: true }
);

book.addEventListener(
    "touchend",
    (event) => {
        const popupIsVisible =
            endPopup.classList.contains("is-visible");

        if (popupIsVisible) return;

        const touch = event.changedTouches[0];

        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const horizontalDistance =
            touchEndX - touchStartX;

        const verticalDistance =
            Math.abs(touchEndY - touchStartY);

        if (verticalDistance > maximumVerticalMovement) {
            return;
        }

        if (horizontalDistance < -minimumSwipeDistance) {
            goToNextSpread();
            return;
        }

        if (horizontalDistance > minimumSwipeDistance) {
            goToPreviousSpread();
        }
    },
    { passive: true }
);

previousButton.addEventListener("click", goToPreviousSpread);
nextButton.addEventListener("click", goToNextSpread);

popupClose.addEventListener("click", hideEndPopup);
restartBook.addEventListener("click", restartFromBeginning);

endPopup.addEventListener("click", (event) => {
    if (event.target === endPopup) {
        hideEndPopup();
    }
});

document.addEventListener("keydown", (event) => {
    const popupIsVisible =
        endPopup.classList.contains("is-visible");

    if (event.key === "Escape" && popupIsVisible) {
        hideEndPopup();
        return;
    }

    if (popupIsVisible) return;

    if (event.key === "ArrowLeft") {
        goToPreviousSpread();
    }

    if (event.key === "ArrowRight") {
        goToNextSpread();
    }
});

updateBook();
