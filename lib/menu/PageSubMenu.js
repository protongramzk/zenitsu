class PageSubMenu {
  constructor(zenitsu, params = {}) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-edit-menu";

    menu.innerHTML = `
      <!-- BACKGROUND SECTION -->
      <div class="menu-section span-12">
        <div class="menu-section-title">BACKGROUND</div>

        <div class="menu-row-2">
          <div class="menu-row">
            <label class="menu-label" style="flex: 1;">Warna</label>
            <input
              class="menu-color"
              type="color"
              data-action="color"
              value="#ffffff"
              style="width: 60px;"
            >
          </div>

          <button
            class="menu-button"
            type="button"
            data-action="transparent"
          >
            <span class="material-symbols-rounded" style="margin-right: 6px;">grid_on</span>
            Transparan
          </button>
        </div>
      </div>

      <div class="menu-divider"></div>

      <!-- UKURAN & PRESET SECTION -->
      <div class="menu-section span-12">
        <div class="menu-section-title">PRESET UKURAN</div>

        <div class="menu-color-grid">
          ${this.preset("1:1")}
          ${this.preset("4:5")}
          ${this.preset("16:9")}
          ${this.preset("9:16")}
          ${this.preset("3:4")}
          ${this.preset("4:3")}
        </div>

        <div class="menu-section-title" style="margin-top: 8px;">DIMENSI (PX)</div>

        <div class="menu-row-2">
          <div class="menu-row">
            <span class="menu-label">W</span>
            <input
              class="menu-input"
              type="number"
              min="1"
              data-action="width"
              placeholder="Lebar"
            >
          </div>

          <div class="menu-row">
            <span class="menu-label">H</span>
            <input
              class="menu-input"
              type="number"
              min="1"
              data-action="height"
              placeholder="Tinggi"
            >
          </div>
        </div>

        <button
          class="menu-button menu-button-primary"
          type="button"
          data-action="apply"
          style="margin-top: 4px;"
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
        class="menu-button"
        type="button"
        data-ratio="${ratio}"
        style="padding: 0; min-height: 36px;"
      >
        ${ratio}
      </button>
    `;
  }

  bind(menu) {
    const width = menu.querySelector('[data-action="width"]');
    const height = menu.querySelector('[data-action="height"]');
    const color = menu.querySelector('[data-action="color"]');
    const transparent = menu.querySelector('[data-action="transparent"]');
    const apply = menu.querySelector('[data-action="apply"]');

    if (color) {
      color.addEventListener("input", () => {
        this.zenitsu.setPageBackground(color.value);
      });
    }

    if (transparent) {
      transparent.addEventListener("click", () => {
        this.zenitsu.setPageTransparent();
      });
    }

    menu.querySelectorAll("[data-ratio]").forEach(button => {
      button.addEventListener("click", () => {
        const [w, h] = button.dataset.ratio.split(":").map(Number);
        this.zenitsu.setPageRatio(w, h);
        this.syncSize(menu);
      });
    });

    if (apply) {
      apply.addEventListener("click", () => {
        const w = Number(width.value);
        const h = Number(height.value);

        if (w <= 0 || h <= 0) return;

        this.zenitsu.resizePage(w, h);
        this.syncSize(menu);
      });
    }
  }

  syncSize(menu) {
    const canvas = this.zenitsu.getCanvas();
    if (!canvas) return;

    const widthInput = menu.querySelector('[data-action="width"]');
    const heightInput = menu.querySelector('[data-action="height"]');

    if (widthInput) {
      widthInput.value = Math.round(canvas.getWidth());
    }

    if (heightInput) {
      heightInput.value = Math.round(canvas.getHeight());
    }
  }
}

/* =========================================================
   REGISTER
   ========================================================= */

Zenitsu.registerMenu("page-submenu", PageSubMenu);
