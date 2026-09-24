class PageSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className = "zenitsu-page-menu";

    menu.innerHTML = `
      <div class="page-section">
        <div class="page-title">Background</div>

        <div class="page-grid">
          <label class="page-field">
            <span>Warna</span>
            <input
              type="color"
              data-action="color"
              value="#ffffff"
            >
          </label>

          <button
            class="page-option"
            type="button"
            data-action="transparent"
          >
            <span class="material-symbols-rounded">
              grid_on
            </span>
            <span>Transparan</span>
          </button>
        </div>
      </div>

      <div class="page-section">
        <div class="page-title">Ukuran</div>

        <div class="page-grid presets">
          ${this.preset("1:1")}
          ${this.preset("4:5")}
          ${this.preset("16:9")}
          ${this.preset("9:16")}
          ${this.preset("3:4")}
          ${this.preset("4:3")}
        </div>

        <div class="page-grid size-inputs">
          <label class="page-field">
            <span>W</span>
            <input
              type="number"
              min="1"
              data-action="width"
            >
          </label>

          <label class="page-field">
            <span>H</span>
            <input
              type="number"
              min="1"
              data-action="height"
            >
          </label>
        </div>

        <button
          class="page-apply"
          type="button"
          data-action="apply"
        >
          Terapkan Ukuran
        </button>
      </div>
    `;

    this.bind(menu);
    this.syncSize(menu);

    return menu;
  }

  preset(ratio) {
    return `
      <button
        class="page-option"
        type="button"
        data-ratio="${ratio}"
      >
        ${ratio}
      </button>
    `;
  }

  bind(menu) {
    const width =
      menu.querySelector('[data-action="width"]');

    const height =
      menu.querySelector('[data-action="height"]');

    const color =
      menu.querySelector('[data-action="color"]');

    const transparent =
      menu.querySelector('[data-action="transparent"]');

    const apply =
      menu.querySelector('[data-action="apply"]');

    color.addEventListener("input", () => {
      this.zenitsu.setPageBackground(
        color.value
      );
    });

    transparent.addEventListener("click", () => {
      this.zenitsu.setPageTransparent();
    });

    menu.querySelectorAll("[data-ratio]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () => {
            const [w, h] =
              button.dataset.ratio
                .split(":")
                .map(Number);

            this.zenitsu.setPageRatio(w, h);
            this.syncSize(menu);
          }
        );
      });

    apply.addEventListener("click", () => {
      const w = Number(width.value);
      const h = Number(height.value);

      if (w <= 0 || h <= 0) return;

      this.zenitsu.resizePage(w, h);
      this.syncSize(menu);
    });
  }

  syncSize(menu) {
    const canvas =
      this.zenitsu.getCanvas();

    if (!canvas) return;

    menu.querySelector(
      '[data-action="width"]'
    ).value = Math.round(canvas.getWidth());

    menu.querySelector(
      '[data-action="height"]'
    ).value = Math.round(canvas.getHeight());
  }
}

Zenitsu.registerMenu(
  "page-submenu",
  PageSubMenu
);
