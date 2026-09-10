/* ==================================================
   SOMEWHERE TO BE — BOOK VIEWER
   ================================================== */

const instagramUrl = "https://www.instagram.com/alta.jo/";
const purchaseUrl = "https://YOUR-BOOK-PURCHASE-LINK.com/";

const spreads = [
    { left: "images/001.jpg", right: "images/002.jpg" },
    { left: "images/003.jpg", right: "images/004.jpg" },
    { left: "images/005.jpg", right: "images/006.jpg" },
    { left: "images/007.jpg", right: "images/008.jpg" },
    { left: "images/009.jpg", right: "images/0010.jpg" },
    { left: "images/0011.jpg", right: "images/0012.jpg" },
    { left: "images/0013.jpg", right: "images/0014.jpg" },
    { left: "images/0015.jpg", right: "images/0016.jpg" },
    { left: "images/0017.jpg", right: "images/0018.jpg" },
    { left: "images/0019.jpg", right: "images/0020.jpg" },
    { left: "images/0021.jpg", right: "images/0022.jpg" }
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
const outsideScrollCue = document.getElementById("outside-scroll-cue");
const projectEditions = document.querySelector(".project-editions");

let currentSpread = 0;
let popupTimer;
let editionsUnlocked = false;

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

function unlockProjectEditions() {
    if (!projectEditions || editionsUnlocked) return;

    editionsUnlocked = true;
    projectEditions.classList.add("is-unlocked");
    projectEditions.setAttribute("aria-hidden", "false");

    if (outsideScrollCue) {
        outsideScrollCue.classList.add("is-visible");
        outsideScrollCue.setAttribute("aria-hidden", "false");
    }
}

function lockProjectEditions() {
    if (!projectEditions) return;

    editionsUnlocked = false;
    projectEditions.classList.remove("is-unlocked");
    projectEditions.setAttribute("aria-hidden", "true");

    if (outsideScrollCue) {
        outsideScrollCue.classList.remove("is-visible");
        outsideScrollCue.setAttribute("aria-hidden", "true");
    }
}

function showEndPopup() {
    window.clearTimeout(popupTimer);

    /* The lower part of the page only exists after Next is pressed
       while the reader is already on the final spread. */
    unlockProjectEditions();

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
    lockProjectEditions();
    hideEndPopup();

    window.scrollTo({ top: 0, behavior: "smooth" });
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

/* Hide clothing / object sections until their image files actually exist. */
function setupOptionalProductImages() {
    const optionalSections = document.querySelectorAll("[data-optional-products]");

    optionalSections.forEach((section) => {
        const articles = [...section.querySelectorAll(".floating-product")];
        if (!articles.length) return;

        const checkSection = () => {
            const visibleArticles = articles.filter(
                (article) => !article.classList.contains("is-missing")
            );
            section.classList.toggle("is-empty", visibleArticles.length === 0);
        };

        articles.forEach((article) => {
            const image = article.querySelector("img");
            if (!image) return;

            const markMissing = () => {
                article.classList.add("is-missing");
                checkSection();
            };

            image.addEventListener("error", markMissing, { once: true });

            if (image.complete && image.naturalWidth === 0) {
                markMissing();
            }
        });

        checkSection();
    });
}

/* SWIPE SUPPORT */
let touchStartX = 0;
let touchStartY = 0;
const minimumSwipeDistance = 50;
const maximumVerticalMovement = 80;

book.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

book.addEventListener("touchend", (event) => {
    const popupIsVisible = endPopup.classList.contains("is-visible");
    if (popupIsVisible) return;

    const touch = event.changedTouches[0];
    const horizontalDistance = touch.clientX - touchStartX;
    const verticalDistance = Math.abs(touch.clientY - touchStartY);

    if (verticalDistance > maximumVerticalMovement) return;

    if (horizontalDistance < -minimumSwipeDistance) {
        goToNextSpread();
        return;
    }

    if (horizontalDistance > minimumSwipeDistance) {
        goToPreviousSpread();
    }
}, { passive: true });

previousButton.addEventListener("click", goToPreviousSpread);
nextButton.addEventListener("click", goToNextSpread);
popupClose.addEventListener("click", hideEndPopup);
restartBook.addEventListener("click", restartFromBeginning);

endPopup.addEventListener("click", (event) => {
    if (event.target === endPopup) hideEndPopup();
});

document.addEventListener("keydown", (event) => {
    const popupIsVisible = endPopup.classList.contains("is-visible");

    if (event.key === "Escape" && popupIsVisible) {
        hideEndPopup();
        return;
    }

    if (popupIsVisible) return;

    if (event.key === "ArrowLeft") goToPreviousSpread();
    if (event.key === "ArrowRight") goToNextSpread();
});

setupOptionalProductImages();
updateBook();
