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

function enableMobileThemes() {

  clearHoverStates();

  if (mobileObserver) {
    mobileObserver.disconnect();
  }

  /*
    The center band of the screen decides which project owns
    the background color. As you swipe from one book to the
    next, the background smoothly transitions with you.
  */
  mobileObserver =
    new IntersectionObserver(
      (entries) => {

        const visible =
          entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

        if (!visible.length) {
          return;
        }

        const activeProject =
          visible[0].target;

        setTheme(
          activeProject.dataset.theme
        );
      },
      {
        root: null,

        /*
          Only the middle section of the viewport counts.
          This prevents the color from changing too early.
        */
        rootMargin:
          "-32% 0px -32% 0px",

        threshold:
          [0, 0.15, 0.35, 0.6, 0.85]
      }
    );


  projects.forEach(
    (project) =>
      mobileObserver.observe(project)
  );


  /*
    Pick the project closest to the viewport center on load,
    so refreshing halfway down the page gets the right color.
  */
  requestAnimationFrame(() => {

    const viewportCenter =
      window.innerHeight / 2;

    let closestProject = null;
    let closestDistance = Infinity;

    projects.forEach(
      (project) => {

        const rect =
          project.getBoundingClientRect();

        const projectCenter =
          rect.top +
          rect.height / 2;

        const distance =
          Math.abs(
            projectCenter -
            viewportCenter
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closestProject =
            project;
        }
      }
    );

    if (closestProject) {
      setTheme(
        closestProject.dataset.theme
      );
    }
  });
}


function disableMobileThemes() {

  if (mobileObserver) {
    mobileObserver.disconnect();
    mobileObserver = null;
  }

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
