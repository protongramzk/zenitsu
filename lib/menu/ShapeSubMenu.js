class ShapeSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className = "zenitsu-menu-level";

    menu.append(
      ZenitsuMenuHelpers.createButton(
        "circle",
        "Circle",
        () => this.addCircle()
      ),

      ZenitsuMenuHelpers.createButton(
        "rectangle",
        "Rect",
        () => this.addRect()
      )
    );

    return menu;
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
