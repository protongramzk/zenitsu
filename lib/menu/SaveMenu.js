class SaveMenu {
  constructor(zenitsu, params = {}) {
    this.zenitsu = zenitsu;
    this.format = "png";
    this.quality = "normal";
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-edit-menu";

    menu.innerHTML = `
      <!-- FORMAT PENYIMPANAN -->
      <div class="menu-section span-12">
        <div class="menu-section-title">FORMAT GAMBAR</div>

        <div class="menu-row-2">
          <button
            type="button"
            class="menu-button menu-button-primary"
            data-format="png"
          >
            <span class="material-symbols-rounded" style="margin-right: 6px;">image</span>
            PNG
          </button>

          <button
            type="button"
            class="menu-button"
            data-format="jpeg"
          >
            <span class="material-symbols-rounded" style="margin-right: 6px;">photo</span>
            JPG
          </button>
        </div>
      </div>

      <div class="menu-divider"></div>

      <!-- KUALITAS GAMBAR -->
      <div class="menu-section span-12">
        <div class="menu-section-title">KUALITAS</div>

        <div class="menu-row-3">
          <button
            type="button"
            class="menu-button"
            data-quality="low"
          >
            Low
          </button>

          <button
            type="button"
            class="menu-button menu-button-primary"
            data-quality="normal"
          >
            Normal
          </button>

          <button
            type="button"
            class="menu-button"
            data-quality="high"
          >
            High
          </button>
        </div>
      </div>

      <div class="menu-divider"></div>

      <!-- TOMBOL DOWNLOAD / SIMPAN -->
      <div class="menu-section span-12">
        <button
          type="button"
          class="menu-button menu-button-primary"
          data-action="save"
          style="width: 100%; height: 44px; font-weight: 700;"
        >
          <span class="material-symbols-rounded" style="margin-right: 8px;">download</span>
          Simpan Gambar
        </button>
      </div>
    `;

    this.bind(menu);

    return menu;
  }

  bind(menu) {
    const formatButtons = menu.querySelectorAll("[data-format]");
    const qualityButtons = menu.querySelectorAll("[data-quality]");

    // EVENT LISTENER UNTUK FORMAT (PNG/JPG)
    formatButtons.forEach(button => {
      button.addEventListener("click", () => {
        this.format = button.dataset.format;

        formatButtons.forEach(item => {
          const isActive = item === button;
          item.classList.toggle("menu-button-primary", isActive);
        });
      });
    });

    // EVENT LISTENER UNTUK KUALITAS (LOW/NORMAL/HIGH)
    qualityButtons.forEach(button => {
      button.addEventListener("click", () => {
        this.quality = button.dataset.quality;

        qualityButtons.forEach(item => {
          const isActive = item === button;
          item.classList.toggle("menu-button-primary", isActive);
        });
      });
    });

    // TOMBOL SIMPAN
    const saveBtn = menu.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        this.zenitsu.saveAs(this.format, this.quality);
      });
    }
  }
}

/* =========================================================
   REGISTER
   ========================================================= */

Zenitsu.registerMenu("save-menu", SaveMenu);
