class ShapeSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className = "zenitsu-menu-level";

    menu.append(
      this.createButton(
        "circle",
        "Circle",
        () => this.addCircle()
      ),

      this.createButton(
        "rectangle",
        "Rect",
        () => this.addRect()
      )
    );

    return menu;
  }

  createButton(icon, label, action) {
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

    button.addEventListener(
      "click",
      action
    );

    return button;
  }

  addCircle() {
    const object = new ZFB.Circle({
      left: 100,
      top: 100,
      radius: 60,
      fill: "#4f46e5"
    });

    this.zenitsu.add(object, true);
    this.zenitsu.openObjectEditor(object);
  }

  addRect() {
    const object = new ZFB.Rect({
      left: 100,
      top: 100,
      width: 140,
      height: 100,
      rx: 0,
      ry: 0,
      fill: "#4f46e5"
    });

    this.zenitsu.add(object, true);
    this.zenitsu.openObjectEditor(object);
  }
}

Zenitsu.registerMenu(
  "shape-submenu",
  ShapeSubMenu
);
