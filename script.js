const projects =
  document.querySelectorAll(".project");

const body =
  document.body;


/* ---------------------------------
   PROJECT HOVER
---------------------------------- */

projects.forEach((project) => {

  const bookWrap =
    project.querySelector(".book-wrap");

  const theme =
    project.dataset.theme;


  project.addEventListener(
    "mouseenter",
    () => {

      project.classList.add(
        "is-hovering"
      );

      body.classList.remove(
        "theme-summer",
        "theme-light"
      );

      body.classList.add(
        `theme-${theme}`
      );

    }
  );


  project.addEventListener(
    "mouseleave",
    () => {

      project.classList.remove(
        "is-hovering"
      );

      body.classList.remove(
        "theme-summer",
        "theme-light"
      );

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

      if (
        window.innerWidth <= 700
      ) {
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
