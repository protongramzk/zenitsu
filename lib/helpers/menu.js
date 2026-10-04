(function (global) {
  function createButton(icon, label, action, className = "zenitsu-menu-button") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;

    if (icon) {
      const iconElement = document.createElement("span");
      iconElement.className = "material-symbols-rounded";
      iconElement.textContent = icon;
      button.append(iconElement);
    }

    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    button.append(labelElement);

    if (action) {
      button.addEventListener("click", action);
    }

    return button;
  }

  function normalizeFontName(name) {
    return String(name ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, character => character.toUpperCase());
  }

  function loadGoogleFont(name) {
    const family = normalizeFontName(name);
    if (!family) return;

    const id = `google-font-${family.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}&display=swap`;
    document.head.append(link);
  }

  global.ZenitsuMenuHelpers = Object.freeze({
    createButton,
    normalizeFontName,
    loadGoogleFont
  });
})(window);