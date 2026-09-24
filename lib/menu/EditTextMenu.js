class EditTextMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu = document.createElement("div");

    menu.className =
      "zenitsu-text-editor";

    const text =
      this.zenitsu.getActiveText();

    if (!text) {
      return menu;
    }

    menu.append(
      this.createColorField(
        "Warna",
        text.fill || "#000000",
        value => {
          this.zenitsu.updateText({
            fill: value
          });
        }
      ),

      this.createColorField(
        "Background",
        text.backgroundColor || "#ffffff",
        value => {
          this.zenitsu.updateText({
            backgroundColor: value
          });
        }
      ),

      this.createFontField(
        text.fontFamily || "Arial"
      ),

      this.createNumberField(
        "Spacing H",
        text.charSpacing ?? 0,
        value => {
          this.zenitsu.updateText({
            charSpacing: Number(value)
          });
        }
      ),

      this.createNumberField(
        "Spacing V",
        text.lineHeight ?? 1.16,
        value => {
          this.zenitsu.updateText({
            lineHeight: Number(value)
          });
        }
      )
    );

    return menu;
  }

  createColorField(label, value, onChange) {
    const wrapper =
      document.createElement("label");

    wrapper.className =
      "zenitsu-field";

    const title =
      document.createElement("span");

    title.textContent = label;

    const input =
      document.createElement("input");

    input.type = "color";

    input.value =
      this.normalizeColor(value);

    input.addEventListener(
      "input",
      () => onChange(input.value)
    );

    wrapper.append(
      title,
      input
    );

    return wrapper;
  }

  createFontField(value) {
    const wrapper =
      document.createElement("label");

    wrapper.className =
      "zenitsu-field";

    const title =
      document.createElement("span");

    title.textContent =
      "Font";

    const input =
      document.createElement("input");

    input.type = "text";
    input.value = value;
    input.placeholder = "Roboto";

    input.addEventListener(
      "change",
      () => {
        const font =
          normalizeFontName(input.value);

        if (!font) return;

        loadGoogleFont(font);

        this.zenitsu.updateText({
          fontFamily: font
        });
      }
    );

    wrapper.append(
      title,
      input
    );

    return wrapper;
  }

  createNumberField(
    label,
    value,
    onChange
  ) {
    const wrapper =
      document.createElement("label");

    wrapper.className =
      "zenitsu-field";

    const title =
      document.createElement("span");

    title.textContent = label;

    const input =
      document.createElement("input");

    input.type = "number";
    input.value = value;
    input.step = "0.1";

    input.addEventListener(
      "input",
      () => onChange(input.value)
    );

    wrapper.append(
      title,
      input
    );

    return wrapper;
  }

  normalizeColor(value) {
    if (
      typeof value !== "string" ||
      !value.startsWith("#")
    ) {
      return "#000000";
    }

    return value;
  }
}
function normalizeFontName(name) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, char =>
      char.toUpperCase()
    );
}

function loadGoogleFont(name) {
  const family =
    name
      .split(" ")
      .join("+");

  const id =
    `google-font-${family}`;

  if (document.getElementById(id)) {
    return;
  }

  const link =
    document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";

  link.href =
    `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

  document.head.append(link);
}

Zenitsu.registerMenu(
  "edit-text",
  EditTextMenu
);
Zenitsu.registerMenu(
  "edit-text",
  EditTextMenu
);

Zenitsu.registerObjectEditor(
  "i-text",
  "edit-text"
);

Zenitsu.registerObjectEditor(
  "textbox",
  "edit-text"
);

Zenitsu.registerObjectEditor(
  "text",
  "edit-text"
);
