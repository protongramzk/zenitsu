class ImageSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-menu-level";

    menu.append(
      this.createButton(
        "upload",
        "Upload",
        () => this.uploadImage()
      ),

      this.createButton(
        "link",
        "URL",
        () => this.insertFromURL()
      )
    );

    return menu;
  }

  createButton(icon, label, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "zenitsu-menu-button";

    button.innerHTML = `
      <span class="material-symbols-rounded">${icon}</span>
      <span>${label}</span>
    `;

    button.addEventListener("click", action);

    return button;
  }

  uploadImage() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

    input.addEventListener("change", () => {
      const file = input.files?.[0];

      if (!file) return;

      const url = URL.createObjectURL(file);

      this.loadImage(url, () => {
        URL.revokeObjectURL(url);
      });
    });

    input.click();
  }

  insertFromURL() {
    const url = prompt("Masukkan URL gambar:");

    if (!url?.trim()) return;

    this.loadImage(url.trim());
  }

  loadImage(source, onFinish = null) {
    ZFB.Image.fromURL(
      source,
      image => {
        if (!image) {
          console.error("[Zenitsu] Gagal memuat gambar.");
          onFinish?.();
          return;
        }

        this.fitImageToCanvas(image);

        image.set({
          left: 100,
          top: 100
        });

        this.zenitsu.add(image, true);
        this.zenitsu.openObjectEditor(image);

        onFinish?.();
      },
      {
        crossOrigin: "anonymous"
      }
    );
  }

  fitImageToCanvas(image) {
    const canvas = this.zenitsu.getCanvas();

    if (!canvas) return;

    const canvasWidth = canvas.getWidth();
    const maxWidth = canvasWidth * 0.9;

    const imageWidth = image.width || 0;

    if (!imageWidth || imageWidth <= maxWidth) {
      return;
    }

    const scale = maxWidth / imageWidth;

    image.scale(scale);
    image.setCoords();
  }
}

Zenitsu.registerMenu(
  "image-submenu",
  ImageSubMenu
);
