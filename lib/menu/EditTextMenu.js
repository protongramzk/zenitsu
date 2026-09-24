class EditTextMenu {
  constructor(zenitsu, params = {}) {
    this.zenitsu = zenitsu;
    this.object = params.object || zenitsu.getActiveText();
  }

  render() {
    const menu = document.createElement("div");

    menu.className = "zenitsu-edit-menu";

    menu.innerHTML = `
      <!-- WARNA -->
      <div class="menu-section">
        <div class="menu-section-title">WARNA</div>

        <label class="menu-label">
          <span>Warna Teks</span>
          <input
            class="menu-color"
            type="color"
            data-action="text-color"
          >
        </label>

        <label class="menu-label">
          <span>Warna Background</span>
          <input
            class="menu-color"
            type="color"
            data-action="background-color"
          >
        </label>
      </div>

      <div class="menu-divider"></div>

      <!-- FONT -->
      <div class="menu-section">
        <div class="menu-section-title">FONT</div>

        <input
          class="menu-input"
          type="text"
          placeholder="Nama Font"
          data-action="font-name"
        >

        <button
          type="button"
          class="menu-button menu-button-primary"
          data-action="process-font"
        >
          Proses Font
        </button>
      </div>

      <div class="menu-divider"></div>

      <!-- STROKE -->
      <div class="menu-section">
        <div class="menu-section-title">STROKE</div>

        <label class="menu-label">
          <span>Warna Stroke</span>
          <input
            class="menu-color"
            type="color"
            data-action="stroke-color"
          >
        </label>

        <label class="menu-label">
          <span>Ketebalan Stroke</span>
          <output class="menu-output" data-output="stroke-width">
            0
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="0"
          max="20"
          step="1"
          value="0"
          data-action="stroke-width"
        >
      </div>

      <div class="menu-divider"></div>

      <!-- SHADOW -->
      <div class="menu-section">
        <div class="menu-section-title">SHADOW</div>

        <label class="menu-label">
          <span>Warna Shadow</span>
          <input
            class="menu-color"
            type="color"
            data-action="shadow-color"
          >
        </label>

        <label class="menu-label">
          <span>Ketebalan Shadow</span>
          <output class="menu-output" data-output="shadow-blur">
            0
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="0"
          max="50"
          step="1"
          value="0"
          data-action="shadow-blur"
        >

        <label class="menu-label">
          <span>X Shadow</span>
          <output class="menu-output" data-output="shadow-x">
            0
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="-50"
          max="50"
          step="1"
          value="0"
          data-action="shadow-x"
        >

        <label class="menu-label">
          <span>Y Shadow</span>
          <output class="menu-output" data-output="shadow-y">
            0
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="-50"
          max="50"
          step="1"
          value="0"
          data-action="shadow-y"
        >
      </div>

      <div class="menu-divider"></div>

      <!-- SPACING -->
      <div class="menu-section">
        <div class="menu-section-title">SPACING</div>

        <label class="menu-label">
          <span>Spacing H</span>
          <output class="menu-output" data-output="spacing-h">
            0
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="-100"
          max="300"
          step="1"
          value="0"
          data-action="spacing-h"
        >

        <label class="menu-label">
          <span>Spacing V</span>
          <output class="menu-output" data-output="spacing-v">
            1.16
          </output>
        </label>

        <input
          class="menu-range"
          type="range"
          min="0.5"
          max="3"
          step="0.01"
          value="1.16"
          data-action="spacing-v"
        >
      </div>
    `;

    this.bind(menu);
    this.sync(menu);

    return menu;
  }
bind(menu) {
  menu.querySelector('[data-action="text-color"]')
    .addEventListener("input", event => {
      this.update({
        fill: event.target.value
      });
    });

  menu.querySelector('[data-action="background-color"]')
    .addEventListener("input", event => {
      this.update({
        backgroundColor: event.target.value
      });
    });

  menu.querySelector('[data-action="process-font"]')
    .addEventListener("click", () => {
      const input =
        menu.querySelector('[data-action="font-name"]');

      const name =
        normalizeFontName(input.value);

      if (!name) return;

      loadGoogleFont(name);

      this.update({
        fontFamily: name
      });

      input.value = name;
    });

  // STROKE COLOR
  const strokeColor =
    menu.querySelector('[data-action="stroke-color"]');

  strokeColor.addEventListener("input", event => {
    const object = this.getText();

    if (!object) return;

    object.set("stroke", event.target.value);
    object.setCoords();

    this.zenitsu
      .getCanvas()
      .requestRenderAll();
  });

  // STROKE WIDTH
  const strokeWidth =
    menu.querySelector('[data-action="stroke-width"]');

  strokeWidth.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.update({
      strokeWidth: value
    });

    this.output(
      menu,
      "stroke-width",
      value
    );
  });

  // SHADOW COLOR
  const shadowColor =
    menu.querySelector('[data-action="shadow-color"]');

  shadowColor.addEventListener("input", event => {
    this.updateShadow(menu, {
      color: event.target.value
    });
  });

  // SHADOW BLUR
  const shadowBlur =
    menu.querySelector('[data-action="shadow-blur"]');

  shadowBlur.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.updateShadow(menu, {
      blur: value
    });

    this.output(
      menu,
      "shadow-blur",
      value
    );
  });

  // SHADOW X
  const shadowX =
    menu.querySelector('[data-action="shadow-x"]');

  shadowX.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.updateShadow(menu, {
      offsetX: value
    });

    this.output(
      menu,
      "shadow-x",
      value
    );
  });

  // SHADOW Y
  const shadowY =
    menu.querySelector('[data-action="shadow-y"]');

  shadowY.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.updateShadow(menu, {
      offsetY: value
    });

    this.output(
      menu,
      "shadow-y",
      value
    );
  });

  // SPACING H
  const spacingH =
    menu.querySelector('[data-action="spacing-h"]');

  spacingH.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.update({
      charSpacing: value
    });

    this.output(
      menu,
      "spacing-h",
      value
    );
  });

  // SPACING V
  const spacingV =
    menu.querySelector('[data-action="spacing-v"]');

  spacingV.addEventListener("input", event => {
    const value =
      Number(event.target.value);

    this.update({
      lineHeight: value
    });

    this.output(
      menu,
      "spacing-v",
      value.toFixed(2)
    );
  });
}

  sync(menu) {
    const object = this.getText();

    if (!object) return;

    this.setValue(
      menu,
      "text-color",
      this.toColor(object.fill, "#000000")
    );

    this.setValue(
      menu,
      "background-color",
      this.toColor(object.backgroundColor, "#ffffff")
    );

    this.setValue(
      menu,
      "font-name",
      object.fontFamily || "Arial"
    );

    this.setValue(
      menu,
      "stroke-color",
      this.toColor(object.stroke, "#000000")
    );

    this.setValue(
      menu,
      "stroke-width",
      object.strokeWidth || 0
    );

    const shadow = object.shadow;

    let shadowColor = "#000000";
    let shadowBlur = 0;
    let shadowX = 0;
    let shadowY = 0;

    if (shadow) {
      shadowColor =
        this.toColor(shadow.color, "#000000");

      shadowBlur =
        Number(shadow.blur) || 0;

      shadowX =
        Number(shadow.offsetX) || 0;

      shadowY =
        Number(shadow.offsetY) || 0;
    }

    this.setValue(
      menu,
      "shadow-color",
      shadowColor
    );

    this.setValue(
      menu,
      "shadow-blur",
      shadowBlur
    );

    this.setValue(
      menu,
      "shadow-x",
      shadowX
    );

    this.setValue(
      menu,
      "shadow-y",
      shadowY
    );

    this.setValue(
      menu,
      "spacing-h",
      object.charSpacing || 0
    );

    this.setValue(
      menu,
      "spacing-v",
      object.lineHeight || 1.16
    );

    this.output(
      menu,
      "stroke-width",
      object.strokeWidth || 0
    );

    this.output(
      menu,
      "shadow-blur",
      shadowBlur
    );

    this.output(
      menu,
      "shadow-x",
      shadowX
    );

    this.output(
      menu,
      "shadow-y",
      shadowY
    );

    this.output(
      menu,
      "spacing-h",
      object.charSpacing || 0
    );

    this.output(
      menu,
      "spacing-v",
      Number(object.lineHeight || 1.16).toFixed(2)
    );
  }

  updateShadow(menu, changes) {
    const object = this.getText();

    if (!object) return;

    const current = object.shadow || {};

    const shadow = new ZFB.Shadow({
      color:
        changes.color ??
        current.color ??
        "#000000",

      blur:
        changes.blur ??
        current.blur ??
        0,

      offsetX:
        changes.offsetX ??
        current.offsetX ??
        0,

      offsetY:
        changes.offsetY ??
        current.offsetY ??
        0
    });

    object.set({
      shadow
    });

    object.setCoords();

    this.zenitsu.getCanvas().renderAll();
  }

  update(props) {
    const object = this.getText();

    if (!object) return null;

    return this.zenitsu.update(
      props,
      object
    );
  }

  getText() {
    const object = this.object;

    if (
      object &&
      (
        object.type === "i-text" ||
        object.type === "text" ||
        object.type === "textbox"
      )
    ) {
      return object;
    }

    return this.zenitsu.getActiveText();
  }

  setValue(menu, action, value) {
    const element =
      menu.querySelector(
        `[data-action="${action}"]`
      );

    if (element) {
      element.value = value;
    }
  }

  output(menu, name, value) {
    const element =
      menu.querySelector(
        `[data-output="${name}"]`
      );

    if (element) {
      element.textContent = value;
    }
  }

  toColor(value, fallback) {
    if (
      typeof value === "string" &&
      /^#[0-9a-f]{6}$/i.test(value)
    ) {
      return value;
    }

    return fallback;
  }
}


/* =========================================================
   FONT HELPERS
   ========================================================= */

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

  if (
    document.getElementById(id)
  ) {
    return;
  }

  const link =
    document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";

  link.href =
    `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

  document.head.appendChild(link);
}


/* =========================================================
   REGISTER
   ========================================================= */

Zenitsu.registerMenu(
  "edit-text",
  EditTextMenu
);

Zenitsu.registerObjectEditor(
  "i-text",
  "edit-text"
);

Zenitsu.registerObjectEditor(
  "text",
  "edit-text"
);

Zenitsu.registerObjectEditor(
  "textbox",
  "edit-text"
);
