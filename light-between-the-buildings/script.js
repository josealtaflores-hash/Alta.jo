/* ==================================================
   LIGHT BETWEEN THE BUILDINGS — BOOK VIEWER
   ================================================== */

const TOTAL_PAGES = 14;
const purchaseUrl = "#";

function pageFile(number) {
    return number <= 9 ? `images/00${number}.jpg` : `images/00${number}.jpg`;
}

const spreads = [];
for (let page = 1; page <= TOTAL_PAGES; page += 2) {
    spreads.push({
        left: pageFile(page),
        right: page + 1 <= TOTAL_PAGES ? pageFile(page + 1) : null
    });
}

const book = document.getElementById("book");
const leftPageImage = document.getElementById("left-page-image");
const rightPageImage = document.getElementById("right-page-image");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const pageNumber = document.getElementById("page-number");
const purchaseButton = document.getElementById("mid-book-purchase");
const outsideScrollCue = document.getElementById("outside-scroll-cue");
const projectEditions = document.querySelector(".project-editions");

const printPreviewModal = document.getElementById("print-preview-modal");
const printPreviewImage = document.getElementById("print-preview-image");
const printPreviewTitle = document.getElementById("print-preview-title");
const printPreviewNext = document.getElementById("print-preview-next");
const printPreviewTriggers = document.querySelectorAll("[data-print-preview]");
const printPreviewCloseButtons = document.querySelectorAll("[data-print-close]");
const teePreviewModal = document.getElementById("tee-preview-modal");
const teePreviewTriggers = document.querySelectorAll("[data-tee-preview]");
const teePreviewCloseButtons = document.querySelectorAll("[data-tee-close]");

const printPreviews = [
    {
        title: "PRINT 01",
        image: "images/prints/print-01.jpg",
        page: "prints/print-01.html"
    },
    {
        title: "PRINT 02",
        image: "images/prints/print-02.jpg",
        page: "prints/print-02.html"
    },
    {
        title: "PRINT 03",
        image: "images/prints/print-03.jpg",
        page: "prints/print-03.html"
    }
];

let currentSpread = 0;
let editionsUnlocked = false;

/* 7 spreads total, so show purchase from spread 4 onward (pages 7–8). */
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

function updatePurchaseButton() {
    if (!purchaseButton) return;

    const shouldShow = currentSpread >= purchaseRevealSpread;
    purchaseButton.classList.toggle("is-visible", shouldShow);
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

    if (isLastSpread) {
        unlockProjectEditions();
        return;
    }

    currentSpread += 1;
    updateBook();
}

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

function openPrintPreview(index) {
    if (!printPreviewModal) return;

    const print = printPreviews[index];
    if (!print) return;

    printPreviewImage.src = print.image;
    printPreviewImage.alt = `${print.title} larger preview`;
    printPreviewTitle.textContent = print.title;
    printPreviewNext.href = print.page;

    printPreviewModal.classList.add("is-visible");
    printPreviewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("print-preview-open");
}

function closePrintPreview() {
    if (!printPreviewModal) return;

    printPreviewModal.classList.remove("is-visible");
    printPreviewModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("print-preview-open");
}

function openTeePreview() {
    if (!teePreviewModal) return;

    teePreviewModal.classList.add("is-visible");
    teePreviewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("print-preview-open");
}

function closeTeePreview() {
    if (!teePreviewModal) return;

    teePreviewModal.classList.remove("is-visible");
    teePreviewModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("print-preview-open");
}

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
    },
    { passive: true }
);

previousButton.addEventListener("click", goToPreviousSpread);
nextButton.addEventListener("click", goToNextSpread);

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        goToPreviousSpread();
    }

    if (event.key === "ArrowRight") {
        goToNextSpread();
    }

    if (event.key === "Escape" && printPreviewModal?.classList.contains("is-visible")) {
        closePrintPreview();
    }

    if (event.key === "Escape" && teePreviewModal?.classList.contains("is-visible")) {
        closeTeePreview();
    }
});

if (outsideScrollCue) {
    outsideScrollCue.addEventListener("click", () => {
        unlockProjectEditions();
    });
}

printPreviewTriggers.forEach((trigger) => {
    const index = Number(trigger.dataset.printPreview);

    trigger.addEventListener("click", () => openPrintPreview(index));

    if (trigger.matches("[role='button']")) {
        trigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPrintPreview(index);
            }
        });
    }
});

printPreviewCloseButtons.forEach((button) => {
    button.addEventListener("click", closePrintPreview);
});

teePreviewTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openTeePreview);

    if (trigger.matches("[role='button']")) {
        trigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTeePreview();
            }
        });
    }
});

teePreviewCloseButtons.forEach((button) => {
    button.addEventListener("click", closeTeePreview);
});

lockProjectEditions();
setupOptionalProductImages();
updateBook();
