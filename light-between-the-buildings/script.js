/* ==================================================
   THE LIGHT BETWEEN THE BUILDINGS — BOOK VIEWER
   ================================================== */

const TOTAL_PAGES = 14;
const purchaseUrl = "downloads/the-light-between-the-buildings-screen-preview.pdf";

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
const zineDownload = document.querySelector(".zine-download");

const printPreviewModal = document.getElementById("print-preview-modal");
const printPreviewImage = document.getElementById("print-preview-image");
const printPreviewTitle = document.getElementById("print-preview-title");
const printPreviewSizes = document.getElementById("print-preview-sizes");
const printPreviewBuy = document.getElementById("print-preview-buy");
const printPreviewTriggers = document.querySelectorAll("[data-print-preview]");
const printPreviewCloseButtons = document.querySelectorAll("[data-print-close]");
const teePreviewModal = document.getElementById("tee-preview-modal");
const teePreviewTriggers = document.querySelectorAll("[data-tee-preview]");
const teePreviewCloseButtons = document.querySelectorAll("[data-tee-close]");

const printPreviews = [
    {
        title: "PRINT 01",
        image: "images/prints/print-01.jpg",
        sizes: "8 × 12 — $25",
        buy: "https://buy.prints.io/p/d967479223b8e1f78cb2"
    },
    {
        title: "PRINT 02",
        image: "images/prints/print-02.jpg",
        sizes: "8 × 12 — $25",
        buy: "https://buy.prints.io/p/c2fc48b8562a10be6c2b"
    },
    {
        title: "PRINT 03",
        image: "images/prints/print-03.jpg",
        sizes: "8 × 12 — $25",
        buy: "https://buy.prints.io/p/365e993f0361c494edb4"
    }
];

let currentSpread = 0;
let editionsUnlocked = false;

/* Show the mid-book copy/download CTA beginning with pages 3–4. */
const purchaseRevealSpread = 1;

/* Reveal SCROLL and unlock the lower zine/shop area at pages 7–8. */
const scrollRevealSpread = 3;

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

    /*
      Once pages 7–8 are reached, reveal the SCROLL cue and make
      the note / prints / wearables area available below the book.
      It stays unlocked after that point.
    */
    if (currentSpread >= scrollRevealSpread) {
        unlockProjectEditions();
    }

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

function setupSectionScrollReveal() {
    const sections = document.querySelectorAll(".zine-note, .prints-section, .wearables-section");
    if (!sections.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sections.forEach((section) => section.classList.add("is-revealed"));
        return;
    }

    sections.forEach((section) => section.classList.add("section-scroll-reveal"));

    const sectionObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.14,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
}

function setupZineDownloadReveal() {
    if (!zineDownload) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        zineDownload.classList.add("is-revealed");
        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                zineDownload.classList.add("is-revealed");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.28,
            rootMargin: "0px 0px -10% 0px"
        }
    );

    revealObserver.observe(zineDownload);
}

function openPrintPreview(index) {
    if (!printPreviewModal) return;

    const print = printPreviews[index];
    if (!print) return;

    printPreviewImage.src = print.image;
    printPreviewImage.alt = `${print.title} larger preview`;
    printPreviewTitle.textContent = print.title;
    if (printPreviewSizes) printPreviewSizes.textContent = print.sizes;
    if (printPreviewBuy) printPreviewBuy.href = print.buy;

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

/* ==================================================
   PRINT REQUEST FORM — static-site friendly
   Copies the request and opens @alta.jo on Instagram.
   ================================================== */

const printRequestOpen = document.getElementById("open-print-request");
const printRequestModal = document.getElementById("print-request-modal");
const printRequestForm = document.getElementById("print-request-form");
const printRequestStatus = document.getElementById("print-request-status");
const printRequestCloseButtons = document.querySelectorAll("[data-request-close]");

function openPrintRequest() {
    if (!printRequestModal) return;
    printRequestModal.classList.add("is-visible");
    printRequestModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("print-request-open");

    const firstField = printRequestForm?.querySelector("input, select, textarea");
    window.setTimeout(() => firstField?.focus(), 120);
}

function closePrintRequest() {
    if (!printRequestModal) return;
    printRequestModal.classList.remove("is-visible");
    printRequestModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("print-request-open");
}

async function copyPrintRequest(message) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
        return;
    }

    const temp = document.createElement("textarea");
    temp.value = message;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
}

printRequestOpen?.addEventListener("click", openPrintRequest);
printRequestCloseButtons.forEach((button) => button.addEventListener("click", closePrintRequest));

printRequestForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(printRequestForm);
    const contact = String(data.get("contact") || "").trim();
    const source = String(data.get("source") || "").trim();
    const photo = String(data.get("photo") || "").trim();
    const notes = String(data.get("notes") || "").trim();

    const message = [
        "PRINT REQUEST — THE LIGHT BETWEEN THE BUILDINGS",
        `Name / handle: ${contact}`,
        `Seen in: ${source}`,
        `Page / photo: ${photo}`,
        notes ? `Notes: ${notes}` : null
    ].filter(Boolean).join("\n");

    try {
        await copyPrintRequest(message);
        if (printRequestStatus) {
            printRequestStatus.textContent = "Request copied — Instagram is opening. Paste it into a DM to @alta.jo.";
        }
        window.open("https://www.instagram.com/alta.jo/", "_blank", "noopener,noreferrer");
    } catch (error) {
        if (printRequestStatus) {
            printRequestStatus.textContent = "Open @alta.jo on Instagram and send the page or photo you’d like printed.";
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && printRequestModal?.classList.contains("is-visible")) {
        closePrintRequest();
    }
});

lockProjectEditions();
setupOptionalProductImages();
setupZineDownloadReveal();
setupSectionScrollReveal();
updateBook();
