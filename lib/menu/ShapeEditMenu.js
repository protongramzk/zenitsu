class ShapeEditMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu =
      document.createElement("div");

    menu.className =
      "zenitsu-shape-editor";

    const object =
      this.zenitsu.getActiveShape();

    if (!object) {
      return menu;
    }

    menu.append(
      this.createColorField(
        "Warna",
        object.fill,
        value => {
          this.zenitsu.update({
            fill: value
          });
        }
      ),

      this.createStrokeSection(object)
    );

    if (
      object.type === "rect"
    ) {
      menu.append(
        this.createRadiusField(object)
      );
    }

    return menu;
  }

  createColorField(
    label,
    value,
    onChange
  ) {
    const wrapper =
      document.createElement("label");

    wrapper.className =
      "shape-field";

    wrapper.innerHTML = `
      <span>${label}</span>

      <input
        type="color"
        value="${this.toHex(value)}"
      >
    `;

    const input =
      wrapper.querySelector("input");

    input.addEventListener(
      "input",
      () => onChange(input.value)
    );

    return wrapper;
  }

  createRadiusField(object) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "shape-field shape-slider";

    wrapper.innerHTML = `
      <div class="shape-slider-head">
        <span>Radius</span>
        <output>${object.rx || 0}</output>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value="${object.rx || 0}"
      >
    `;

    const slider =
      wrapper.querySelector("input");

    const output =
      wrapper.querySelector("output");

    slider.addEventListener(
      "input",
      () => {
        const value =
          Number(slider.value);

        output.value = value;
        output.textContent = value;

        this.zenitsu.update({
          rx: value,
          ry: value
        });
      }
    );

    return wrapper;
  }

  createStrokeSection(object) {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "shape-stroke";

    const enabled =
      !!object.stroke;

    wrapper.innerHTML = `
      <div class="shape-slider-head">
        <span>Stroke</span>

        <input
          type="checkbox"
          ${enabled ? "checked" : ""}
        >
      </div>

      <div class="shape-grid">
        <label class="shape-field">
          <span>Warna</span>

          <input
            type="color"
            value="${this.toHex(
              object.stroke || "#000000"
            )}"
          >
        </label>

        <div class="shape-field shape-slider">
          <div class="shape-slider-head">
            <span>Ketebalan</span>
            <output>
              ${object.strokeWidth || 0}
            </output>
          </div>

          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value="${object.strokeWidth || 0}"
          >
        </div>
      </div>
    `;

    const checkbox =
      wrapper.querySelector(
        'input[type="checkbox"]'
      );

    const color =
      wrapper.querySelector(
        'input[type="color"]'
      );

    const width =
      wrapper.querySelector(
        'input[type="range"]'
      );

    const output =
      wrapper.querySelector("output");

    checkbox.addEventListener(
      "change",
      () => {
        this.zenitsu.update({
          stroke: checkbox.checked
            ? color.value
            : null,

          strokeWidth:
            checkbox.checked
              ? Number(width.value)
              : 0
        });
      }
    );

    color.addEventListener(
      "input",
      () => {
        if (!checkbox.checked) {
          checkbox.checked = true;
        }

        this.zenitsu.update({
          stroke: color.value
        });
      }
    );

    width.addEventListener(
      "input",
      () => {
        const value =
          Number(width.value);

        output.value = value;
        output.textContent = value;

        if (!checkbox.checked) {
          checkbox.checked = true;
        }

        this.zenitsu.update({
          stroke: color.value,
          strokeWidth: value
        });
      }
    );

    return wrapper;
  }

  toHex(value) {
    if (
      typeof value !== "string"
    ) {
      return "#000000";
    }

    if (
      value.startsWith("#") &&
      value.length === 7
    ) {
      return value;
    }

    return "#000000";
  }
}

Zenitsu.registerMenu(
  "shape-edit",
  ShapeEditMenu
);

Zenitsu.registerObjectEditor(
  "circle",
  "shape-edit"
);

Zenitsu.registerObjectEditor(
  "rect",
  "shape-edit"
);
