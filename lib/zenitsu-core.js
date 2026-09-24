/**
 * ZENITSU CANVAS ENGINE
 * Core + Canvas CRUD + Menu Registry + Navigation Stack
 *
 * Global Instance:
 *   window.Zenitsu
 *
 * Fabric Alias:
 *   window.ZFB
 */
(function () {
  class ZenitsuEngine {
    constructor() {
      /* ===================================================
       * CANVAS
       * =================================================== */

      this.canvas = null;
      this.activeObject = null;


      /* ===================================================
       * EVENT SYSTEM
       * =================================================== */

      this.listeners = {};


      /* ===================================================
       * MENU REGISTRY
       * =================================================== */

      // id -> MenuClass
      this.menuRegistry = new Map();
      this.objectEditors = new Map();
      // id -> { instance, element }
      this.activeMenus = new Map();

      // DOM container
      this.menuContainer = null;


      /* ===================================================
       * NAVIGATION
       * =================================================== */

      /*
       * Current menu yang sedang aktif.
       *
       * Contoh:
       *
       * main
       * text
       * font-list
       */
      this.currentMenu = null;


      /*
       * Navigation history.
       *
       * Contoh:
       *
       * [
       *   "main",
       *   "text"
       * ]
       *
       * current = "font-list"
       *
       * Path:
       *
       * main > text > font-list
       */
      this.navigationHistory = [];


      /*
       * Apakah sedang melakukan operasi
       * history sehingga navigateTo()
       * tidak memasukkan history baru.
       */
      this._navigationLock = false;
    }


    /* ===================================================
     * CANVAS INITIALIZATION
     * =================================================== */

    /**
     * Inisialisasi Canvas
     *
     * @param {string} canvasId
     * @param {Object} options
     */
    init(canvasId, options = {}) {
      const defaultOptions = {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        preserveObjectStacking: true
      };

      this.canvas = new fabric.Canvas(
        canvasId,
        {
          ...defaultOptions,
          ...options
        }
      );

      this._bindEvents();

      console.log(
        "⚡ Zenitsu initialized successfully!"
      );

      return this.canvas;
    }
registerObjectEditor(type, menuId) {
  if (!type || !menuId) {
    console.error(
      "[Zenitsu] Object editor membutuhkan type dan menuId."
    );

    return false;
  }

  if (!this.hasMenu(menuId)) {
    console.error(
      `[Zenitsu] Editor menu '${menuId}' belum terdaftar.`
    );

    return false;
  }

  this.objectEditors.set(type, menuId);

  console.log(
    `[Zenitsu] Editor '${menuId}' registered untuk object '${type}'.`
  );

  return true;
}
getObjectEditor(type) {
  return this.objectEditors.get(type) || null;
}
openObjectEditor(object = null) {
  const target =
    object || this.getActiveObject();

  if (!target) return false;

  const menuId =
    this.getObjectEditor(target.type);

  if (!menuId) return false;

  return this.navigateTo(
    menuId,
    {
      object: target
    }
  );
}

    /* ===================================================
     * MENU CONTAINER
     * =================================================== */

    /**
     * Daftarkan container DOM tempat menu dirender.
     *
     * @param {string|HTMLElement} container
     */
    setMenuContainer(container) {
      this.menuContainer =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!this.menuContainer) {
        console.error(
          "[Zenitsu] Menu container tidak ditemukan."
        );

        return false;
      }

      return true;
    }


    /* ===================================================
     * MENU REGISTRY
     * =================================================== */

    /**
     * Register menu.
     *
     * @param {string} id
     * @param {Class} MenuClass
     */
    registerMenu(id, MenuClass) {
      if (!id) {
        console.error(
          "[Zenitsu] Menu ID tidak boleh kosong."
        );

        return false;
      }

      if (typeof MenuClass !== "function") {
        console.error(
          `[Zenitsu] Menu '${id}' harus berupa Class/function.`
        );

        return false;
      }

      if (this.menuRegistry.has(id)) {
        console.warn(
          `[Zenitsu] Menu '${id}' sudah terdaftar.`
        );

        return false;
      }

      this.menuRegistry.set(
        id,
        MenuClass
      );

      console.log(
        `[Zenitsu] Registered Menu: ${id}`
      );

      return true;
    }


    /**
     * Cek apakah menu terdaftar.
     */
    hasMenu(id) {
      return this.menuRegistry.has(id);
    }


    /**
     * Ambil class menu.
     */
    getMenu(id) {
      return this.menuRegistry.get(id) || null;
    }


    /* ===================================================
     * NAVIGATION
     * =================================================== */

    /**
     * Navigasi ke menu.
     *
     * Default:
     *
     * main
     *   ↓
     * text
     *   ↓
     * font-list
     *
     * Akan menghasilkan:
     *
     * history:
     * ["main", "text"]
     *
     * current:
     * "font-list"
     *
     * @param {string} id
     * @param {Object} params
     * @param {Object} options
     */
    navigateTo(
      id,
      params = {},
      options = {}
    ) {
      if (!this.hasMenu(id)) {
        console.error(
          `[Zenitsu] Menu '${id}' belum terdaftar di Registry!`
        );

        return false;
      }

      if (!this.menuContainer) {
        console.error(
          "[Zenitsu] Menu Container belum diset."
        );

        return false;
      }


      /*
       * Kalau menu yang diminta sama
       * dengan menu aktif, jangan buat
       * history duplicate.
       */

      if (
        this.currentMenu === id &&
        !options.force
      ) {
        return false;
      }


      /*
       * Tambahkan current ke history
       * sebelum pindah.
       *
       * Kecuali navigation sedang
       * melakukan operasi internal.
       */

      if (
        this.currentMenu &&
        !this._navigationLock &&
        options.addHistory !== false
      ) {
        this.navigationHistory.push(
          this.currentMenu
        );
      }


      /*
       * Current menu berubah.
       */

      const previousMenu =
        this.currentMenu;

      this.currentMenu = id;


      /*
       * Menu lama HARUS dibersihkan.
       *
       * Ini berbeda dari sistem lama
       * yang membiarkan submenu
       * menumpuk.
       */

      this.closeAllMenus();


      /*
       * Render menu baru.
       */

      const menuInstance =
        this._createMenuInstance(
          id,
          params
        );

      if (!menuInstance) {
        /*
         * Kalau gagal render,
         * rollback current.
         */

        this.currentMenu =
          previousMenu;

        return false;
      }


      /*
       * Simpan menu aktif.
       */

      this.activeMenus.set(
        id,
        {
          instance: menuInstance,
          element: menuInstance.__element
        }
      );


      /*
       * Event.
       */

      this.emit(
        "menu:opened",
        {
          id,
          instance: menuInstance,
          previous: previousMenu,
          params
        }
      );


      this.emit(
        "navigation:changed",
        this.getNavigationState()
      );


      return true;
    }


    /**
     * Internal menu creator.
     */
    _createMenuInstance(
      id,
      params = {}
    ) {
      const MenuClass =
        this.menuRegistry.get(id);

      if (!MenuClass) {
        return null;
      }


      let menuInstance;

      try {
        menuInstance =
          new MenuClass(
            this,
            params
          );
      } catch (error) {
        console.error(
          `[Zenitsu] Gagal membuat menu '${id}'.`,
          error
        );

        return null;
      }


      if (
        typeof menuInstance.render !==
        "function"
      ) {
        console.error(
          `[Zenitsu] Menu '${id}' wajib memiliki method render().`
        );

        return null;
      }


      let menuElement;

      try {
        menuElement =
          menuInstance.render();
      } catch (error) {
        console.error(
          `[Zenitsu] Gagal render menu '${id}'.`,
          error
        );

        return null;
      }


      if (
        !(menuElement instanceof HTMLElement)
      ) {
        console.error(
          `[Zenitsu] render() menu '${id}' harus mengembalikan HTMLElement.`
        );

        return null;
      }


      /*
       * Tandai elemen dengan ID menu.
       */

      menuElement.dataset.zenitsuMenu =
        id;


      /*
       * Tambahkan ke DOM.
       */

      this.menuContainer.appendChild(
        menuElement
      );


      /*
       * Simpan reference internal.
       */

      menuInstance.__element =
        menuElement;


      return menuInstance;
    }


    /* ===================================================
     * BACK
     * =================================================== */

    /**
     * Kembali satu level.
     *
     * main > text > font-list
     *
     * back()
     *
     * main > text
     */
    back() {
      if (
        this.navigationHistory.length === 0
      ) {
        return false;
      }


      const previous =
        this.navigationHistory.pop();

      const current =
        this.currentMenu;


      /*
       * Lock supaya navigateTo()
       * tidak menambahkan current
       * kembali ke history.
       */

      this._navigationLock = true;


      const result =
        this.navigateTo(
          previous,
          {},
          {
            addHistory: false,
            force: true
          }
        );


      this._navigationLock = false;


      if (result) {

        this.emit(
          "navigation:back",
          {
            from: current,
            to: previous
          }
        );

      }


      return result;
    }
getActiveShape() {
  const object =
    this.getActiveObject();

  if (!object) return null;

  const shapes = [
    "circle",
    "rect",
    "triangle",
    "ellipse",
    "polygon",
    "polyline",
    "line"
  ];

  return shapes.includes(object.type)
    ? object
    : null;
}

    /* ===================================================
     * RESET NAVIGATION
     * =================================================== */

    /**
     * Kembali langsung ke root/main.
     *
     * main > text > font-list
     *
     * menjadi:
     *
     * main
     */
    resetNavigation(
      root = "main",
      params = {}
    ) {
      if (!this.hasMenu(root)) {
        console.error(
          `[Zenitsu] Root menu '${root}' belum terdaftar.`
        );

        return false;
      }


      const previous =
        this.currentMenu;


      this.navigationHistory = [];

      this._navigationLock = true;


      const result =
        this.navigateTo(
          root,
          params,
          {
            addHistory: false,
            force: true
          }
        );


      this._navigationLock = false;


      if (result) {

        this.emit(
          "navigation:reset",
          {
            from: previous,
            to: root
          }
        );

      }


      return result;
    }

resizePage(width, height) {
  if (!this.canvas) return false;

  width = Math.max(1, Number(width));
  height = Math.max(1, Number(height));

  this.canvas.setDimensions({
    width,
    height
  });

  this.canvas.renderAll();

  this.emit("page:resized", {
    width,
    height
  });

  return true;
}

setPageBackground(color) {
  if (!this.canvas) return false;

  this.canvas.setBackgroundColor(
    color,
    () => this.canvas.renderAll()
  );

  return true;
}

setPageTransparent() {
  if (!this.canvas) return false;

  this.canvas.setBackgroundColor(
    "transparent",
    () => this.canvas.renderAll()
  );

  return true;
}

setPageRatio(ratioW, ratioH) {
  if (!this.canvas) return false;

  const currentWidth =
    this.canvas.getWidth();

  const width = currentWidth;
  const height =
    width * ratioH / ratioW;

  return this.resizePage(
    width,
    height
  );
}
    /* ===================================================
     * NAVIGATION STATE
     * =================================================== */

    /**
     * Mengambil state navigation.
     *
     * Contoh:
     *
     * {
     *   current: "font-list",
     *   history: ["main", "text"],
     *   path: ["main", "text", "font-list"],
     *   canGoBack: true
     * }
     */
    getNavigationState() {

      const path = [
        ...this.navigationHistory,
        ...(this.currentMenu
          ? [this.currentMenu]
          : [])
      ];


      return {
        current: this.currentMenu,

        history: [
          ...this.navigationHistory
        ],

        path,

        canGoBack:
          this.navigationHistory.length > 0
      };
    }


    /**
     * Ambil current menu.
     */
    getCurrentMenu() {
      return this.currentMenu;
    }


    /**
     * Ambil history.
     */
    getNavigationHistory() {
      return [
        ...this.navigationHistory
      ];
    }


    /**
     * Ambil full path.
     */
    getNavigationPath() {

      return [
        ...this.navigationHistory,
        ...(this.currentMenu
          ? [this.currentMenu]
          : [])
      ];
    }


    /**
     * Apakah bisa Back?
     */
    canGoBack() {
      return (
        this.navigationHistory.length > 0
      );
    }


    /* ===================================================
     * CLOSE MENU
     * =================================================== */

    /**
     * Tutup menu berdasarkan ID.
     */
    closeMenu(id) {
      if (!this.activeMenus.has(id)) {
        return false;
      }


      const {
        instance,
        element
      } =
        this.activeMenus.get(id);


      /*
       * Lifecycle.
       */

      if (
        typeof instance.onDestroy ===
        "function"
      ) {
        try {
          instance.onDestroy();
        } catch (error) {
          console.error(
            `[Zenitsu] Error onDestroy '${id}'.`,
            error
          );
        }
      }


      /*
       * Hapus DOM.
       */

      if (element) {
        element.remove();
      }


      this.activeMenus.delete(id);


      this.emit(
        "menu:closed",
        {
          id,
          instance
        }
      );


      return true;
    }


    /**
     * Tutup seluruh menu.
     */
    closeAllMenus() {

      /*
       * Array.from supaya Map aman
       * saat sedang dihapus.
       */

      const ids =
        Array.from(
          this.activeMenus.keys()
        );


      ids.forEach(id => {
        this.closeMenu(id);
      });


      /*
       * Extra safety:
       *
       * kalau ada elemen menu yang
       * tertinggal di DOM tapi tidak
       * tercatat di Map.
       */

      if (this.menuContainer) {

        this.menuContainer
          .querySelectorAll(
            "[data-zenitsu-menu]"
          )
          .forEach(element => {
            element.remove();
          });

      }
    }


    /**
     * Alias kompatibilitas.
     *
     * Sebelumnya:
     *
     * closeAllSubmenus()
     */
    closeAllSubmenus(exceptId = null) {

      if (!exceptId) {
        this.closeAllMenus();
        return;
      }


      const ids =
        Array.from(
          this.activeMenus.keys()
        );


      ids.forEach(id => {

        if (id !== exceptId) {
          this.closeMenu(id);
        }

      });
    }


    /* ===================================================
     * CANVAS API
     * =================================================== */

    getCanvas() {
      return this.canvas;
    }


    getActiveObject() {
      return this.canvas
        ? this.canvas.getActiveObject()
        : null;
    }


    add(
      fabricObject,
      autoSelect = true
    ) {
      if (!this.canvas) {
        return null;
      }


      this.canvas.add(
        fabricObject
      );


      if (autoSelect) {
        this.canvas.setActiveObject(
          fabricObject
        );
      }


      this.canvas.renderAll();


      return fabricObject;
    }


    update(
      props,
      targetObj = null
    ) {
      const obj =
        targetObj ||
        this.getActiveObject();


      if (!obj) {
        return null;
      }


      obj.set(props);

      obj.setCoords();

      this.canvas.renderAll();


      return obj;
    }


    remove(
      targetObj = null
    ) {
      const obj =
        targetObj ||
        this.getActiveObject();


      if (!obj) {
        return null;
      }


      this.canvas.remove(obj);

      this.canvas.renderAll();


      return obj;
    }


    /* ===================================================
     * EVENTS
     * =================================================== */

    _bindEvents() {

      if (!this.canvas) {
        return;
      }


      this.canvas.on(
  "selection:created",
  () => {
    this.activeObject =
      this.getActiveObject();

    this.emit(
      "selection:changed",
      this.activeObject
    );

    this.openObjectEditor(
      this.activeObject
    );
  }
);

this.canvas.on(
  "selection:updated",
  () => {
    this.activeObject =
      this.getActiveObject();

    this.emit(
      "selection:changed",
      this.activeObject
    );

    this.openObjectEditor(
      this.activeObject
    );
  }
);
      
      this.canvas.on(
        "selection:cleared",
        () => {

          this.activeObject = null;

          this.emit(
            "selection:changed",
            null
          );

        }
      );


      /*
       * Canvas interaction events.
       */

      this.canvas.on(
        "mouse:down",
        event => {

          this.emit(
            "canvas:mousedown",
            event
          );

        }
      );


      this.canvas.on(
        "mouse:up",
        event => {

          this.emit(
            "canvas:mouseup",
            event
          );

        }
      );


      this.canvas.on(
        "object:added",
        event => {

          this.emit(
            "object:added",
            event
          );

        }
      );


      this.canvas.on(
        "object:modified",
        event => {

          this.emit(
            "object:modified",
            event
          );

        }
      );


      this.canvas.on(
        "object:removed",
        event => {

          this.emit(
            "object:removed",
            event
          );

        }
      );
    }


    /**
     * Subscribe event.
     *
     * @returns {Function} unsubscribe
     */
    on(
      eventName,
      callback
    ) {
      if (
        typeof callback !==
        "function"
      ) {
        return () => {};
      }


      if (
        !this.listeners[eventName]
      ) {
        this.listeners[eventName] = [];
      }


      this.listeners[eventName]
        .push(callback);


      /*
       * Return unsubscribe function.
       */

      return () => {

        this.off(
          eventName,
          callback
        );

      };
    }


    /**
     * Unsubscribe event.
     */
    off(
      eventName,
      callback
    ) {
      const listeners =
        this.listeners[eventName];


      if (!listeners) {
        return;
      }


      this.listeners[eventName] =
        listeners.filter(
          cb => cb !== callback
        );
    }
saveAs(format = "png", quality = "normal") {
  if (!this.canvas) {
    return false;
  }

  const qualityMap = {
    low: 0.5,
    normal: 0.8,
    high: 1
  };

  const multiplier = 1;

  const options = {
    format,
    multiplier
  };

  if (format === "jpeg") {
    options.quality =
      qualityMap[quality] ?? 0.8;

    options.backgroundColor =
      this.canvas.backgroundColor ||
      "#ffffff";
  }

  const dataURL =
    this.canvas.toDataURL(options);

  const extension =
    format === "jpeg"
      ? "jpg"
      : "png";

  const link =
    document.createElement("a");

  link.href = dataURL;

  link.download =
    `zenitsu-${Date.now()}.${extension}`;

  link.click();

  this.emit(
    "document:saved",
    {
      format,
      quality,
      dataURL
    }
  );

  return true;
}
createText(text = "Text", options = {}) {
  if (!this.canvas) return null;

  const {
    left = 100,
    top = 100,
    ...props
  } = options;

  const object = new fabric.IText(text, {
    left,
    top,

    fontFamily: "Arial",
    fontSize: 32,

    fill: "#000000",
    backgroundColor: "",

    charSpacing: 0,
    lineHeight: 1.16,

    ...props
  });

  this.add(object, true);

  return object;
}

getActiveText() {
  const object = this.getActiveObject();

  if (!object) return null;

  if (
    object.type !== "i-text" &&
    object.type !== "text" &&
    object.type !== "textbox"
  ) {
    return null;
  }

  return object;
}

updateText(props) {
  const text = this.getActiveText();

  if (!text) return null;

  return this.update(props, text);
}
    /**
     * Emit event.
     */
    emit(
      eventName,
      data
    ) {
      const listeners =
        this.listeners[eventName];


      if (!listeners) {
        return;
      }


      /*
       * slice() supaya callback
       * boleh melakukan unsubscribe
       * tanpa merusak iterasi.
       */

      listeners
        .slice()
        .forEach(callback => {

          try {
            callback(data);
          } catch (error) {

            console.error(
              `[Zenitsu] Error pada event '${eventName}'.`,
              error
            );

          }

        });
    }
  }


  /* =====================================================
   * GLOBAL INSTANCE
   * ===================================================== */

  window.Zenitsu =
    new ZenitsuEngine();


  /*
   * Short alias untuk Fabric.js.
   */

  window.ZFB =
    fabric;

})();
