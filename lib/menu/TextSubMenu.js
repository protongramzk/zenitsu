class TextSubMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className =
      "zenitsu-menu-level level-1";

    const button = document.createElement("button");

    button.className =
      "zenitsu-menu-button";

    button.innerHTML = `
      <span class="material-symbols-rounded">
        add
      </span>

      <span>Add Text</span>
    `;

    button.addEventListener("click", () => {
      const text =
        this.zenitsu.createText("Text");

      if (!text) return;

      this.zenitsu.navigateTo(
        "edit-text"
      );
    });

    menu.append(button);

    return menu;
  }
}

Zenitsu.registerMenu(
  "text-submenu",
  TextSubMenu
);
