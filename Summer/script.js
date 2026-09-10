/* ==================================================
   SOMEWHERE TO BE — BOOK VIEWER
   ================================================== */

/* Replace # with your Blurb/Lulu/direct purchase link when ready. */
const purchaseUrl = "#";

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
const purchaseButton = document.getElementById("mid-book-purchase");
const outsideScrollCue = document.getElementById("outside-scroll-cue");
const projectEditions = document.querySelector(".project-editions");

let currentSpread = 0;
let editionsUnlocked = false;

/* Show the purchase button beginning with pages 11–12 (spread 6 of 11). */
const purchaseRevealSpread = Math.floor(spreads.length / 2);

if (purchaseButton) {
    purchaseButton.href = purchaseUrl;

    if (purchaseUrl === "#") {
        purchaseButton.setAttribute("aria-disabled", "true");
        purchaseButton.addEventListener("click", (event) => event.preventDefault());
    }
}

function preloadSpread(index) {
    if (index < 0 || index >= spreads.length) return;

    const leftImage = new Image();
    const rightImage = new Image();

    leftImage.src = spreads[index].left;
    rightImage.src = spreads[index].right;
}

function updatePurchaseButton() {
    if (!purchaseButton) return;

    const shouldShow = currentSpread >= purchaseRevealSpread;
    purchaseButton.classList.toggle("is-visible", shouldShow);
}

function updateBook() {
    const spread = spreads[currentSpread];

    leftPageImage.src = spread.left;
    rightPageImage.src = spread.right;

    const leftPageNumber = currentSpread * 2 + 1;
    const rightPageNumber = leftPageNumber + 1;

    pageNumber.textContent = `${leftPageNumber}–${rightPageNumber}`;
    previousButton.disabled = currentSpread === 0;

    updatePurchaseButton();

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

function goToPreviousSpread() {
    if (currentSpread > 0) {
        currentSpread -= 1;
        updateBook();
    }
}

function goToNextSpread() {
    const isLastSpread = currentSpread === spreads.length - 1;

    /* On the final spread, one more Next press reveals the rest of the project. */
    if (isLastSpread) {
        unlockProjectEditions();
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

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goToPreviousSpread();
    if (event.key === "ArrowRight") goToNextSpread();
});

setupOptionalProductImages();
lockProjectEditions();
updateBook();
