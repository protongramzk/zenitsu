class ShapeEditMenu {
  constructor(zenitsu, params = {}) {
    this.zenitsu = zenitsu;
    this.object = params.object || zenitsu.getActiveShape();
  }

  render() {
    const menu = document.createElement("div");
    menu.className = "zenitsu-edit-menu";

    const object = this.getShape();
    const isRect = object && object.type === "rect";

    menu.innerHTML = `
      <!-- ISIAN (FILL) -->
      <div class="menu-section ${isRect ? "span-6" : "span-12"}">
        <div class="menu-section-title">WARNA ISI</div>
        <label class="menu-label">
          <span>Warna Fill</span>
          <input
            class="menu-color"
            type="color"
            data-action="fill-color"
          >
        </label>
      </div>

      <!-- RADIUS / SUDUT (KHUSUS RECT) -->
      ${
        isRect
          ? `
      <div class="menu-section span-6">
        <div class="menu-section-title">SUDUT</div>
        <label class="menu-label">
          <span>Radius</span>
          <output class="menu-output" data-output="radius">0</output>
        </label>
        <input
          class="menu-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value="0"
          data-action="radius"
        >
      </div>
      `
          : ""
      }

      <div class="menu-divider"></div>

      <!-- GARIS TEPI (STROKE) -->
      <div class="menu-section span-12">
        <div class="menu-row" style="justify-content: space-between;">
          <div class="menu-section-title">GARIS TEPI (STROKE)</div>
          <label class="menu-check" style="min-height: auto; padding: 4px 8px;">
            <input
              type="checkbox"
              data-action="stroke-active"
            >
          </label>
        </div>

        <div class="menu-row-2" style="margin-top: 6px;">
          <div class="menu-row">
            <label class="menu-label" style="flex: 1;">Warna</label>
            <input
              class="menu-color"
              type="color"
              data-action="stroke-color"
              style="width: 50px;"
            >
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div class="menu-label">
              <span>Ketebalan</span>
              <output class="menu-output" data-output="stroke-width">0</output>
            </div>
            <input
              class="menu-range"
              type="range"
              min="0"
              max="30"
              step="1"
              value="0"
              data-action="stroke-width"
            >
          </div>
        </div>
      </div>
    `;

    this.bind(menu);
    this.sync(menu);

    return menu;
  }

  bind(menu) {
    // FILL COLOR
    const fillColor = menu.querySelector('[data-action="fill-color"]');
    if (fillColor) {
      fillColor.addEventListener("input", event => {
        this.update({
          fill: event.target.value
        });
      });
    }

    // RADIUS (KHUSUS RECT)
    const radius = menu.querySelector('[data-action="radius"]');
    if (radius) {
      radius.addEventListener("input", event => {
        const value = Number(event.target.value);
        this.update({
          rx: value,
          ry: value
        });
        this.output(menu, "radius", value);
      });
    }

    // STROKE CHECKBOX & CONTROLS
    const strokeActive = menu.querySelector('[data-action="stroke-active"]');
    const strokeColor = menu.querySelector('[data-action="stroke-color"]');
    const strokeWidth = menu.querySelector('[data-action="stroke-width"]');

    if (strokeActive) {
      strokeActive.addEventListener("change", () => {
        this.update({
          stroke: strokeActive.checked ? strokeColor.value : null,
          strokeWidth: strokeActive.checked ? Number(strokeWidth.value) : 0
        });
      });
    }

    if (strokeColor) {
      strokeColor.addEventListener("input", event => {
        if (strokeActive && !strokeActive.checked) {
          strokeActive.checked = true;
        }

        this.update({
          stroke: event.target.value,
          strokeWidth: Number(strokeWidth.value) || 1
        });
      });
    }

    if (strokeWidth) {
      strokeWidth.addEventListener("input", event => {
        const value = Number(event.target.value);

        if (strokeActive && !strokeActive.checked) {
          strokeActive.checked = true;
        }

        this.update({
          stroke: strokeColor.value,
          strokeWidth: value
        });

        this.output(menu, "stroke-width", value);
      });
    }
  }

  sync(menu) {
    const object = this.getShape();
    if (!object) return;

    // Fill Color
    this.setValue(
      menu,
      "fill-color",
      this.toColor(object.fill, "#000000")
    );

    // Radius (jika objek berupa rect)
    if (object.type === "rect") {
      const radiusVal = object.rx || 0;
      this.setValue(menu, "radius", radiusVal);
      this.output(menu, "radius", radiusVal);
    }

    // Stroke
    const hasStroke = !!object.stroke;
    const strokeActive = menu.querySelector('[data-action="stroke-active"]');
    if (strokeActive) {
      strokeActive.checked = hasStroke;
    }

    const strokeColorVal = this.toColor(object.stroke, "#000000");
    const strokeWidthVal = object.strokeWidth || 0;

    this.setValue(menu, "stroke-color", strokeColorVal);
    this.setValue(menu, "stroke-width", strokeWidthVal);
    this.output(menu, "stroke-width", strokeWidthVal);
  }

  update(props) {
    const object = this.getShape();
    if (!object) return null;

    return this.zenitsu.update(props, object);
  }

  getShape() {
    const object = this.object;

    if (
      object &&
      (
        object.type === "rect" ||
        object.type === "circle" ||
        object.type === "triangle" ||
        object.type === "polygon"
      )
    ) {
      return object;
    }

    return this.zenitsu.getActiveShape();
  }

  setValue(menu, action, value) {
    const element = menu.querySelector(`[data-action="${action}"]`);
    if (element) {
      element.value = value;
    }
  }

  output(menu, name, value) {
    const element = menu.querySelector(`[data-output="${name}"]`);
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
   REGISTER
   ========================================================= */

Zenitsu.registerMenu("shape-edit", ShapeEditMenu);

Zenitsu.registerObjectEditor("circle", "shape-edit");
Zenitsu.registerObjectEditor("rect", "shape-edit");
Zenitsu.registerObjectEditor("triangle", "shape-edit");
Zenitsu.registerObjectEditor("polygon", "shape-edit");
