class SaveMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu =
      document.createElement("div");

    menu.className =
      "zenitsu-save-menu";

    menu.innerHTML = `
      <div class="save-section">

        <div class="save-title">
          Save As
        </div>

        <div class="save-grid">

          <button
            type="button"
            class="save-option active"
            data-format="png"
          >
            <span class="material-symbols-rounded">
              image
            </span>
            <span>PNG</span>
          </button>

          <button
            type="button"
            class="save-option"
            data-format="jpeg"
          >
            <span class="material-symbols-rounded">
              photo
            </span>
            <span>JPG</span>
          </button>

        </div>

      </div>

      <div class="save-section">

        <div class="save-title">
          Quality
        </div>

        <div class="save-quality">

          <button
            type="button"
            data-quality="low"
          >
            Low
          </button>

          <button
            type="button"
            class="active"
            data-quality="normal"
          >
            Normal
          </button>

          <button
            type="button"
            data-quality="high"
          >
            High
          </button>

        </div>

      </div>

      <button
        type="button"
        class="save-button"
        data-action="save"
      >
        <span class="material-symbols-rounded">
          download
        </span>

        Save
      </button>
    `;

    this.bind(menu);

    return menu;
  }

  bind(menu) {
    let format = "png";
    let quality = "normal";

    const formatButtons =
      menu.querySelectorAll(
        "[data-format]"
      );

    const qualityButtons =
      menu.querySelectorAll(
        "[data-quality]"
      );

    formatButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          format =
            button.dataset.format;

          formatButtons.forEach(
            item =>
              item.classList.toggle(
                "active",
                item === button
              )
          );
        }
      );
    });

    qualityButtons.forEach(button => {
      button.addEventListener(
        "click",
        () => {
          quality =
            button.dataset.quality;

          qualityButtons.forEach(
            item =>
              item.classList.toggle(
                "active",
                item === button
              )
          );
        }
      );
    });

    menu.querySelector(
      '[data-action="save"]'
    ).addEventListener(
      "click",
      () => {
        this.zenitsu.saveAs(
          format,
          quality
        );
      }
    );
  }
}

Zenitsu.registerMenu(
  "save-menu",
  SaveMenu
);
