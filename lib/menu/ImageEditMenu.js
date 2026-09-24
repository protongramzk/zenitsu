class ImageEditMenu {
  constructor(zenitsu) {
    this.zenitsu = zenitsu;
  }

  render() {
    const menu =
      document.createElement("div");

    menu.className =
      "zenitsu-image-editor";

    const image =
      this.zenitsu.getActiveImage();

    if (!image) {
      return menu;
    }

    menu.innerHTML = `
      <div class="image-grid">

        <div class="image-section">
          <div class="image-title">
            Radius
          </div>

          <div class="image-slider">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value="${image.cornerRadius || 0}"
              data-control="radius"
            >

            <output data-output="radius">
              ${image.cornerRadius || 0}
            </output>
          </div>
        </div>

        <div class="image-section">
          <div class="image-title">
            Hue
          </div>

          <div class="image-slider">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value="${this.getFilterValue(
                image,
                "HueRotation"
              )}"
              data-control="hue"
            >

            <output data-output="hue">
              0
            </output>
          </div>
        </div>

        <div class="image-section">
          <div class="image-title">
            Saturation
          </div>

          <div class="image-slider">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value="${this.getFilterValue(
                image,
                "Saturation"
              )}"
              data-control="saturation"
            >

            <output data-output="saturation">
              0
            </output>
          </div>
        </div>

        <div class="image-section">
          <div class="image-title">
            Brightness
          </div>

          <div class="image-slider">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value="${this.getFilterValue(
                image,
                "Brightness"
              )}"
              data-control="brightness"
            >

            <output data-output="brightness">
              0
            </output>
          </div>
        </div>

      </div>
    `;

    this.bind(menu);

    return menu;
  }

  bind(menu) {
    this.bindSlider(
      menu,
      "radius",
      value => {
        this.zenitsu.updateImageRadius(
          Number(value)
        );
      }
    );

    this.bindSlider(
      menu,
      "hue",
      value => {
        this.setFilter(
          "HueRotation",
          Number(value)
        );
      }
    );

    this.bindSlider(
      menu,
      "saturation",
      value => {
        this.setFilter(
          "Saturation",
          Number(value)
        );
      }
    );

    this.bindSlider(
      menu,
      "brightness",
      value => {
        this.setFilter(
          "Brightness",
          Number(value)
        );
      }
    );
  }

  bindSlider(
    menu,
    name,
    callback
  ) {
    const input =
      menu.querySelector(
        `[data-control="${name}"]`
      );

    const output =
      menu.querySelector(
        `[data-output="${name}"]`
      );

    input.addEventListener(
      "input",
      () => {
        const value =
          input.value;

        output.textContent =
          Number(value).toFixed(
            name === "radius" ? 0 : 2
          );

        callback(value);
      }
    );
  }

  setFilter(type, value) {
    const image =
      this.zenitsu.getActiveImage();

    if (!image) return;

    const filters =
      image.filters || [];

    const FilterClass =
      ZFB.Image.filters[type];

    if (!FilterClass) return;

    let filter =
      filters.find(
        item =>
          item.type === type
      );

    if (!filter) {
      filter =
        new FilterClass({
          [this.getFilterProperty(type)]:
            value
        });

      filters.push(filter);
    } else {
      filter[
        this.getFilterProperty(type)
      ] = value;
    }

    image.filters =
      filters;

    image.applyFilters();

    image.setCoords();

    this.zenitsu.getCanvas()
      .renderAll();
  }

  getFilterProperty(type) {
    if (type === "HueRotation") {
      return "rotation";
    }

    if (type === "Saturation") {
      return "saturation";
    }

    if (type === "Brightness") {
      return "brightness";
    }

    return null;
  }

  getFilterValue(image, type) {
    const filter =
      image.filters?.find(
        item =>
          item.type === type
      );

    if (!filter) return 0;

    return filter[
      this.getFilterProperty(type)
    ] ?? 0;
  }
}

Zenitsu.registerMenu(
  "image-edit",
  ImageEditMenu
);

Zenitsu.registerObjectEditor(
  "image",
  "image-edit"
);
