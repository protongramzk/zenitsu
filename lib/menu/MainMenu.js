class MainMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className =
      "zenitsu-menu-level level-1";

    menu.append(
      ZenitsuMenuHelpers.createButton(
        "text_format",
        "Text",
        () => this.zenitsu.navigateTo("text-submenu")
      ),
      ZenitsuMenuHelpers.createButton("image", "Image", () => {
        this.zenitsu.navigateTo("image-submenu");
      }),
      ZenitsuMenuHelpers.createButton("shapes", "Shape", () => {
        this.zenitsu.navigateTo("shape-submenu");
      }),
      ZenitsuMenuHelpers.createButton("save", "Save", () => {
        this.zenitsu.navigateTo("save-menu");
      }),
      ZenitsuMenuHelpers.createButton("description", "Halaman", () => {
        this.zenitsu.navigateTo("page-submenu");
      })
    );

    return menu;
  }

}

Zenitsu.registerMenu(
  "main",
  MainMenu
);
