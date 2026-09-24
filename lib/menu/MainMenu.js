class MainMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className =
      "zenitsu-menu-level level-1";

    menu.append(
      this.createButton(
        "text_format",
        "text",
        "Text",
        () => this.zenitsu.navigateTo("text-submenu")
      ),
this.createButton(
  "image",
  "image",
  "Image",
  () => {
    this.zenitsu.navigateTo(
      "image-submenu"
    );
  }
),
this.createButton(
  "shapes",
  "shape",
  "Shape",
  () => {
    this.zenitsu.navigateTo(
      "shape-submenu"
    );
  }
),
this.createButton(
  "save",
  "save",
  "Save",
  () => {
    this.zenitsu.navigateTo(
      "save-menu"
    );
  }
),
this.createButton(
  "description",
  "halaman",
  "Halaman",
  () => this.zenitsu.navigateTo("page-submenu")
))
    return menu;
  }

  createButton(icon, name, label, action) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className =
      "zenitsu-menu-button";

    button.innerHTML = `
      <span class="material-symbols-rounded">
        ${icon}
      </span>

      <span>${label}</span>
    `;

    if (action) {
      button.addEventListener(
        "click",
        action
      );
    }

    return button;
  }
getActiveImage() {
  const object =
    this.getActiveObject();

  return object?.type === "image"
    ? object
    : null;
}
updateImageRadius(radius) {
  const image =
    this.getActiveImage();

  if (!image) return null;

  radius = Math.max(
    0,
    Number(radius) || 0
  );

  image.cornerRadius =
    radius;

  image.setCoords();

  this.canvas.renderAll();

  return image;
}
  addSampleImage() {
    ZFB.Image.fromURL(
      "https://picsum.photos/150/150",
      img => {
        img.set({
          top: 100,
          left: 100
        });

        this.zenitsu.add(img);
      }
    );
  }
}

Zenitsu.registerMenu(
  "main",
  MainMenu
);
