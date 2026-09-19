const projects =
  document.querySelectorAll(".project");

const body =
  document.body;

const mobileQuery =
  window.matchMedia("(max-width: 700px)");

let mobileObserver = null;


/* ---------------------------------
   HELPERS
---------------------------------- */

function setTheme(theme) {
  body.classList.remove(
    "theme-summer",
    "theme-light"
  );

  if (theme) {
    body.classList.add(
      `theme-${theme}`
    );
  }
}


function clearHoverStates() {
  projects.forEach((project) => {
    project.classList.remove(
      "is-hovering"
    );

    const bookWrap =
      project.querySelector(".book-wrap");

    bookWrap.style.setProperty(
      "--rotate",
      "0deg"
    );
  });
}


/* ---------------------------------
   DESKTOP HOVER
---------------------------------- */

projects.forEach((project) => {

  const bookWrap =
    project.querySelector(".book-wrap");

  const theme =
    project.dataset.theme;


  project.addEventListener(
    "mouseenter",
    () => {

      if (mobileQuery.matches) {
        return;
      }

      project.classList.add(
        "is-hovering"
      );

      setTheme(theme);
    }
  );


  project.addEventListener(
    "mouseleave",
    () => {

      if (mobileQuery.matches) {
        return;
      }

      project.classList.remove(
        "is-hovering"
      );

      setTheme(null);

      bookWrap.style.setProperty(
        "--rotate",
        "0deg"
      );
    }
  );


  /* ---------------------------------
     VERY SUBTLE BOOK TILT
  ---------------------------------- */

  project.addEventListener(
    "mousemove",
    (event) => {

      if (mobileQuery.matches) {
        return;
      }

      const rect =
        project.getBoundingClientRect();

      const position =
        (
          event.clientX -
          rect.left
        ) /
        rect.width;

      const rotation =
        (position - 0.5) * 2.2;

      bookWrap.style.setProperty(
        "--rotate",
        `${rotation}deg`
      );
    }
  );

});


/* ---------------------------------
   MOBILE SCROLL THEMES
---------------------------------- */

let activeMobileProject = null;
let mobileScrollTicking = false;

/*
  A project has to be meaningfully closer to the center
  before it takes over the page theme. This "dead zone"
  keeps the background from flipping too quickly while
  casually scrolling between the two books.
*/
const MOBILE_THEME_HANDOFF = 110;


function updateMobileTheme() {

  if (!mobileQuery.matches) {
    return;
  }

  const viewportCenter =
    window.innerHeight / 2;

  const projectData =
    [...projects].map((project) => {

      const rect =
        project.getBoundingClientRect();

      const center =
        rect.top +
        rect.height / 2;

      return {
        project,
        distance:
          Math.abs(
            center -
            viewportCenter
          )
      };
    });


  projectData.sort(
    (a, b) =>
      a.distance -
      b.distance
  );


  const closest =
    projectData[0];


  /*
    First load: use the project nearest the middle
    of the screen.
  */
  if (!activeMobileProject) {

    activeMobileProject =
      closest.project;

    setTheme(
      activeMobileProject.dataset.theme
    );

    return;
  }


  const activeData =
    projectData.find(
      (item) =>
        item.project ===
        activeMobileProject
    );


  /*
    Do not hand the background to the next project
    until it is clearly more central than the current one.
    This makes the current color hold longer.
  */
  if (
    closest.project !==
      activeMobileProject &&
    closest.distance +
      MOBILE_THEME_HANDOFF <
      activeData.distance
  ) {

    activeMobileProject =
      closest.project;

    setTheme(
      activeMobileProject.dataset.theme
    );
  }
}


function handleMobileScroll() {

  if (!mobileQuery.matches) {
    return;
  }

  if (mobileScrollTicking) {
    return;
  }

  mobileScrollTicking = true;

  requestAnimationFrame(() => {

    updateMobileTheme();

    mobileScrollTicking = false;
  });
}


function enableMobileThemes() {

  clearHoverStates();

  activeMobileProject = null;

  updateMobileTheme();

  window.addEventListener(
    "scroll",
    handleMobileScroll,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    handleMobileScroll,
    { passive: true }
  );
}


function disableMobileThemes() {

  window.removeEventListener(
    "scroll",
    handleMobileScroll
  );

  window.removeEventListener(
    "resize",
    handleMobileScroll
  );

  activeMobileProject = null;

  setTheme(null);
}


/* ---------------------------------
   MODE SWITCHING
---------------------------------- */

function syncInteractionMode() {

  if (mobileQuery.matches) {
    enableMobileThemes();
  } else {
    disableMobileThemes();
  }
}


syncInteractionMode();


mobileQuery.addEventListener(
  "change",
  syncInteractionMode
);
