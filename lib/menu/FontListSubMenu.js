class FontListSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-menu-level level-2";

    ["Lato", "Montserrat", "Open Sans", "Poppins", "Roboto"].forEach(font => {
      menu.append(
        ZenitsuMenuHelpers.createButton("font_download", font, () => {
          ZenitsuMenuHelpers.loadGoogleFont(font);

          const text = this.zenitsu.getActiveText()
            || this.zenitsu.createText("Text");

          if (!text) return;

          this.zenitsu.update({ fontFamily: font }, text);
          this.zenitsu.navigateTo("edit-text");
        })
      );
    });

    return menu;
  }
}

Zenitsu.registerMenu("font-list-menu", FontListSubMenu);
