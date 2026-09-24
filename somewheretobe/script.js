/* ==================================================
   SOMEWHERE TO BE — BOOK VIEWER
   ================================================== */

/* Mid-book CTA jumps to the book purchase options below. */

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

/* Show GET A COPY beginning with pages 5–6. */
const purchaseRevealSpread = 2;

/* Unlock the SCROLL cue and the project/shop area beginning with pages 11–12. */
const scrollRevealSpread = 5;

if (purchaseButton) {
    purchaseButton.href = "#about-this-book";

    purchaseButton.addEventListener("click", (event) => {
        event.preventDefault();
        unlockProjectEditions();

        const aboutBook = document.getElementById("about-this-book");
        if (aboutBook) {
            requestAnimationFrame(() => {
                const desktopOffset = 64;
                const mobileOffset = 24;
                const offset = window.matchMedia("(max-width: 700px)").matches
                    ? mobileOffset
                    : desktopOffset;
                const targetTop = aboutBook.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: "smooth"
                });
            });
        }
    });
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

    /*
      Once pages 11–12 are reached, make the lower project area available
      and reveal the hand-drawn SCROLL cue. It stays available afterward.
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


function setupSectionScrollReveal() {
    const sections = document.querySelectorAll(
        ".prints-section, .wearables-section, .objects-section"
    );

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
setupSectionScrollReveal();
lockProjectEditions();
updateBook();

/* ==================================================
   PRINT PREVIEW MODAL
   ================================================== */

const printPreviewModal = document.getElementById("print-preview-modal");
const printPreviewImage = document.getElementById("print-preview-image");
const printPreviewTitle = document.getElementById("print-preview-title");
const printPreviewSizes = document.getElementById("print-preview-sizes");
const printPreviewActions = document.getElementById("print-preview-actions");
const printPreviewBuySmall = document.getElementById("print-preview-buy-small");
const printPreviewBuyLarge = document.getElementById("print-preview-buy-large");
const printPreviewTriggers = document.querySelectorAll("[data-print-preview]");
const printPreviewCloseButtons = document.querySelectorAll("[data-print-close]");

const printPreviews = [
    {
        title: "WANDERING MAN",
        image: "images/prints/print-01.jpg",
        sizes: "8 × 12 — $25 / 12 × 18 — $45",
        buySmall: "https://buy.prints.io/p/a799d34006b6c9ba1bc6",
        buyLarge: "https://buy.prints.io/p/ea98c70261ca7738bf37"
    },
    {
        title: "DOG WALK",
        image: "images/prints/print-02.jpg",
        sizes: "8 × 12 — $25 / 12 × 18 — $45",
        buySmall: "https://buy.prints.io/p/da4bca2cf16caa475212",
        buyLarge: "https://buy.prints.io/p/9c76e34110affd195c40"
    },
    {
        title: "SKATING",
        image: "images/prints/print-03.jpg",
        sizes: "8 × 12 — $25 / 12 × 18 — $45",
        buySmall: "https://buy.prints.io/p/a803041ed7f8c289812c",
        buyLarge: "https://buy.prints.io/p/0dd9b6d2db2af1220c60"
    }
];

function openPrintPreview(index) {
    if (!printPreviewModal) return;

    const print = printPreviews[index];
    if (!print) return;

    printPreviewImage.src = print.image;
    printPreviewImage.alt = `${print.title} larger preview`;
    printPreviewTitle.textContent = print.title;
    if (printPreviewSizes) printPreviewSizes.textContent = print.sizes || "8 × 12 / 12 × 18";

    const hasPurchaseLinks = Boolean(print.buySmall && print.buyLarge);
    if (printPreviewActions) printPreviewActions.hidden = !hasPurchaseLinks;
    if (hasPurchaseLinks) {
        printPreviewBuySmall.href = print.buySmall;
        printPreviewBuyLarge.href = print.buyLarge;
    }

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

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && printPreviewModal?.classList.contains("is-visible")) {
        closePrintPreview();
    }
});

/* ==================================================
   TEE PREVIEW — NUMBERED SHIRTS
   ================================================== */

const teePreviewModal = document.getElementById("tee-preview-modal");
const teePreviewTriggers = document.querySelectorAll("[data-tee-preview]");
const teePreviewCloseButtons = document.querySelectorAll("[data-tee-close]");
const summerWearablesSection = document.getElementById("wearables");
const teePreviewFront = document.getElementById("tee-preview-front");
const teePreviewBack = document.getElementById("tee-preview-back");
const teePreviewTitle = document.getElementById("tee-preview-title");
const teePreviewBuy = document.getElementById("tee-preview-buy");

function setupSummerTeeAvailability() {
    if (!summerWearablesSection) return;

    const items = [...summerWearablesSection.querySelectorAll("[data-tee-item]")];
    if (!items.length) {
        summerWearablesSection.classList.add("is-empty");
        summerWearablesSection.setAttribute("aria-hidden", "true");
        return;
    }

    let resolved = 0;

    const finishCheck = () => {
        resolved += 1;
        if (resolved < items.length) return;

        const visibleItems = items.filter((item) => !item.classList.contains("is-missing"));
        const hasAny = visibleItems.length > 0;
        summerWearablesSection.classList.toggle("is-empty", !hasAny);
        summerWearablesSection.setAttribute("aria-hidden", hasAny ? "false" : "true");
    };

    items.forEach((item) => {
        const image = item.querySelector(".summer-tee-main-image");
        if (!image) {
            item.classList.add("is-missing");
            finishCheck();
            return;
        }

        const ok = () => {
            item.classList.remove("is-missing");
            finishCheck();
        };

        const fail = () => {
            item.classList.add("is-missing");
            finishCheck();
        };

        if (image.complete) {
            image.naturalWidth > 0 ? ok() : fail();
        } else {
            image.addEventListener("load", ok, { once: true });
            image.addEventListener("error", fail, { once: true });
        }
    });
}

function openTeePreview(trigger) {
    if (!teePreviewModal || summerWearablesSection?.classList.contains("is-empty")) return;

    const front = trigger?.dataset?.teeFront;
    const back = trigger?.dataset?.teeBack;
    const title = trigger?.dataset?.teeTitle || "PROJECT TEE";
    const buyUrl = trigger?.dataset?.teeBuyUrl || "";

    if (front && teePreviewFront) {
        teePreviewFront.src = front;
        teePreviewFront.alt = `${title} front`;
    }

    if (back && teePreviewBack) {
        teePreviewBack.src = back;
        teePreviewBack.alt = `${title} back`;
    }

    if (teePreviewTitle) teePreviewTitle.textContent = title;

    if (teePreviewBuy) {
        if (buyUrl) {
            teePreviewBuy.href = buyUrl;
            teePreviewBuy.hidden = false;
        } else {
            teePreviewBuy.removeAttribute("href");
            teePreviewBuy.hidden = true;
        }
    }

    teePreviewModal.classList.add("is-visible");
    teePreviewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tee-preview-open");
}

function closeTeePreview() {
    if (!teePreviewModal) return;

    teePreviewModal.classList.remove("is-visible");
    teePreviewModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tee-preview-open");
}

teePreviewTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openTeePreview(trigger));

    if (trigger.matches("[role='button']")) {
        trigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTeePreview(trigger);
            }
        });
    }
});

teePreviewCloseButtons.forEach((button) => {
    button.addEventListener("click", closeTeePreview);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && teePreviewModal?.classList.contains("is-visible")) {
        closeTeePreview();
    }
});

setupSummerTeeAvailability();


/* ==================================================
   PRINT REQUEST FORM
   Static-site friendly: copy the request and open @alta.jo.
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
        "PRINT REQUEST — SOMEWHERE TO BE",
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
