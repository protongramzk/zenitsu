class TextSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-menu-level level-2";

    menu.append(
      ZenitsuMenuHelpers.createButton("add", "Add Text", () => {
        const text = this.zenitsu.createText("Text");
        if (!text) return;

        this.zenitsu.navigateTo("edit-text");
      }),
      ZenitsuMenuHelpers.createButton("font_download", "Font List", () => {
        this.zenitsu.navigateTo("font-list-menu");
      })
    );

    return menu;
  }
}

Zenitsu.registerMenu(
  "text-submenu",
  TextSubMenu
);
