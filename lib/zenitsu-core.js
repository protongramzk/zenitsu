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
       * MENU SYSTEM
       * =================================================== */

      this.menuRegistry = new Map();
      this.objectEditors = new Map();
      this.activeMenus = new Map();

      this.menuContainer = null;


      /* ===================================================
       * CONTEXT TOOLBAR
       * =================================================== */

      this.contextToolbar = null;


      /* ===================================================
       * NAVIGATION
       * =================================================== */

      this.currentMenu = null;
      this.navigationHistory = [];
      this._navigationLock = false;
    }


    /* =====================================================
     * CANVAS INITIALIZATION
     * ===================================================== */

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


    /* =====================================================
     * CONTEXT TOOLBAR
     * ===================================================== */

    createContextToolbar() {

      if (this.contextToolbar) {
        return this.contextToolbar;
      }

      const toolbar =
        document.createElement("div");

      toolbar.className =
        "zenitsu-context-toolbar";

      toolbar.hidden = true;

      toolbar.innerHTML = `
        <button
          type="button"
          data-action="delete"
          title="Hapus"
        >
          <span class="material-symbols-rounded">
            delete
          </span>
        </button>

        <button
          type="button"
          data-action="duplicate"
          title="Duplikat"
        >
          <span class="material-symbols-rounded">
            content_copy
          </span>
        </button>

        <button
          type="button"
          data-action="export"
          title="Ekspor Bagian"
        >
          <span class="material-symbols-rounded">
            download
          </span>
        </button>
      `;


      /* ---------------------------------------------------
       * DELETE
       * --------------------------------------------------- */

      toolbar
        .querySelector('[data-action="delete"]')
        .addEventListener("click", () => {

          const object =
            this.getActiveObject();

          if (!object) return;

          this.remove(object);
        });


      /* ---------------------------------------------------
       * DUPLICATE
       * --------------------------------------------------- */

      toolbar
        .querySelector('[data-action="duplicate"]')
        .addEventListener("click", () => {

          const object =
            this.getActiveObject();

          if (!object) return;

          this.duplicate(object);
        });


      /* ---------------------------------------------------
       * EXPORT
       * --------------------------------------------------- */

      toolbar
        .querySelector('[data-action="export"]')
        .addEventListener("click", () => {

          const object =
            this.getActiveObject();

          if (!object) return;

          this.exportObject(object);
        });


      document.body.appendChild(toolbar);

      this.contextToolbar = toolbar;

      return toolbar;
    }


    showContextToolbar() {

      const toolbar =
        this.createContextToolbar();

      toolbar.hidden = false;

      this.updateContextToolbar();
    }


    hideContextToolbar() {

      if (!this.contextToolbar) {
        return;
      }

      this.contextToolbar.hidden = true;
    }


    updateContextToolbar() {

      const object =
        this.getActiveObject();

      const toolbar =
        this.contextToolbar;

      const canvas =
        this.canvas;

      if (
        !object ||
        !toolbar ||
        !canvas
      ) {
        return;
      }


      /*
       * Canvas DOM position.
       */

      const canvasElement =
        canvas.upperCanvasEl;

      const canvasRect =
        canvasElement.getBoundingClientRect();


      /*
       * Object bounding box
       * dalam koordinat Fabric.
       */

      const bounds =
        object.getBoundingRect(
          true,
          true
        );


      /*
       * Perbandingan ukuran
       * logical canvas vs displayed canvas.
       */

      const scaleX =
        canvasRect.width /
        canvas.getWidth();

      const scaleY =
        canvasRect.height /
        canvas.getHeight();


      const objectLeft =
        canvasRect.left +
        bounds.left * scaleX;

      const objectTop =
        canvasRect.top +
        bounds.top * scaleY;

      const objectWidth =
        bounds.width * scaleX;

      const objectHeight =
        bounds.height * scaleY;


      /*
       * Ukuran toolbar.
       */

      const toolbarWidth =
        toolbar.offsetWidth;

      const toolbarHeight =
        toolbar.offsetHeight;


      /*
       * Default:
       * toolbar di atas object.
       */

      let left =
        objectLeft +
        (objectWidth - toolbarWidth) / 2;

      let top =
        objectTop -
        toolbarHeight -
        10;


      /*
       * Kalau tidak muat di atas,
       * pindahkan ke bawah.
       */

      if (top < 8) {

        top =
          objectTop +
          objectHeight +
          10;
      }


      /*
       * Jangan sampai keluar layar
       * kiri / kanan.
       */

      left =
        Math.max(
          8,
          Math.min(
            left,
            window.innerWidth -
            toolbarWidth -
            8
          )
        );


      /*
       * Jangan sampai keluar layar
       * bagian bawah.
       */

      top =
        Math.max(
          8,
          Math.min(
            top,
            window.innerHeight -
            toolbarHeight -
            8
          )
        );


      toolbar.style.left =
        `${left}px`;

      toolbar.style.top =
        `${top}px`;
    }


    /* =====================================================
     * OBJECT ACTIONS
     * ===================================================== */

    duplicate(object = null) {

      const target =
        object ||
        this.getActiveObject();

      if (!target) {
        return null;
      }


      target.clone(clone => {

        clone.set({
          left:
            (target.left || 0) + 20,

          top:
            (target.top || 0) + 20
        });


        this.canvas.add(clone);

        this.canvas.setActiveObject(
          clone
        );

        this.activeObject =
          clone;

        clone.setCoords();

        this.canvas.requestRenderAll();

        this.emit(
          "object:duplicated",
          {
            source: target,
            object: clone
          }
        );


        /*
         * Buka editor untuk
         * object hasil duplikasi.
         */

        this.openObjectEditor(clone);

        this.showContextToolbar();
      });


      return true;
    }


    exportObject(object = null) {

      const target =
        object ||
        this.getActiveObject();

      if (
        !target ||
        !this.canvas
      ) {
        return false;
      }


      /*
       * Bounding box object.
       *
       * Ini membuat hasil export
       * hanya sebesar area object.
       */

      const bounds =
        target.getBoundingRect(
          true,
          true
        );


      const dataURL =
        this.canvas.toDataURL({
          format: "png",

          left: bounds.left,
          top: bounds.top,

          width: bounds.width,
          height: bounds.height,

          multiplier: 1
        });


      const link =
        document.createElement("a");

      link.href = dataURL;

      link.download =
        `zenitsu-selection-${Date.now()}.png`;

      link.click();


      this.emit(
        "object:exported",
        {
          object: target,
          dataURL
        }
      );


      return true;
    }


    /* =====================================================
     * OBJECT EDITOR
     * ===================================================== */

    registerObjectEditor(
      type,
      menuId
    ) {

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


      this.objectEditors.set(
        type,
        menuId
      );


      return true;
    }


    getObjectEditor(type) {

      return (
        this.objectEditors.get(type) ||
        null
      );
    }


    openObjectEditor(
      object = null
    ) {

      const target =
        object ||
        this.getActiveObject();

      if (!target) {
        return false;
      }


      const menuId =
        this.getObjectEditor(
          target.type
        );

      if (!menuId) {
        return false;
      }


      /*
       * Kalau editor yang sama
       * masih terbuka, jangan membuat
       * history baru.
       *
       * Cukup beri tahu editor bahwa
       * object berubah.
       */

      if (
        this.currentMenu === menuId
      ) {

        this.emit(
          "object:editor:changed",
          {
            object: target,
            menuId
          }
        );

        return true;
      }


      return this.navigateTo(
        menuId,
        {
          object: target
        }
      );
    }


    /* =====================================================
     * MENU CONTAINER
     * ===================================================== */

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


    /* =====================================================
     * MENU REGISTRY
     * ===================================================== */

    registerMenu(
      id,
      MenuClass
    ) {

      if (!id) {

        console.error(
          "[Zenitsu] Menu ID tidak boleh kosong."
        );

        return false;
      }


      if (
        typeof MenuClass !==
        "function"
      ) {

        console.error(
          `[Zenitsu] Menu '${id}' harus berupa Class/function.`
        );

        return false;
      }


      if (
        this.menuRegistry.has(id)
      ) {

        console.warn(
          `[Zenitsu] Menu '${id}' sudah terdaftar.`
        );

        return false;
      }


      this.menuRegistry.set(
        id,
        MenuClass
      );

      return true;
    }


    hasMenu(id) {

      return this.menuRegistry.has(id);
    }


    getMenu(id) {

      return (
        this.menuRegistry.get(id) ||
        null
      );
    }


    /* =====================================================
     * NAVIGATION
     * ===================================================== */

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


      if (
        this.currentMenu === id &&
        !options.force
      ) {
        return false;
      }


      if (
        this.currentMenu &&
        !this._navigationLock &&
        options.addHistory !== false
      ) {

        this.navigationHistory.push(
          this.currentMenu
        );
      }


      const previousMenu =
        this.currentMenu;

      this.currentMenu = id;


      this.closeAllMenus();


      const menuInstance =
        this._createMenuInstance(
          id,
          params
        );


      if (!menuInstance) {

        this.currentMenu =
          previousMenu;

        return false;
      }


      this.activeMenus.set(
        id,
        {
          instance: menuInstance,
          element:
            menuInstance.__element
        }
      );


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


      menuElement.dataset.zenitsuMenu =
        id;


      this.menuContainer.appendChild(
        menuElement
      );


      menuInstance.__element =
        menuElement;


      return menuInstance;
    }


    /* =====================================================
     * NAVIGATION BACK
     * ===================================================== */

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


    /* =====================================================
     * NAVIGATION STATE
     * ===================================================== */

    getNavigationState() {

      const path = [
        ...this.navigationHistory,

        ...(this.currentMenu
          ? [this.currentMenu]
          : [])
      ];


      return {
        current:
          this.currentMenu,

        history:
          [...this.navigationHistory],

        path,

        canGoBack:
          this.navigationHistory.length > 0
      };
    }


    getCurrentMenu() {

      return this.currentMenu;
    }


    getNavigationHistory() {

      return [
        ...this.navigationHistory
      ];
    }


    getNavigationPath() {

      return [
        ...this.navigationHistory,

        ...(this.currentMenu
          ? [this.currentMenu]
          : [])
      ];
    }


    canGoBack() {

      return (
        this.navigationHistory.length > 0
      );
    }


    /* =====================================================
     * MENU CLOSE
     * ===================================================== */

    closeMenu(id) {

      if (
        !this.activeMenus.has(id)
      ) {
        return false;
      }


      const {
        instance,
        element
      } =
        this.activeMenus.get(id);


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


    closeAllMenus() {

      const ids =
        Array.from(
          this.activeMenus.keys()
        );


      ids.forEach(id => {
        this.closeMenu(id);
      });


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


    closeAllSubmenus(
      exceptId = null
    ) {

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


    /* =====================================================
     * CANVAS API
     * ===================================================== */

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


      this.canvas.requestRenderAll();


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

      this.canvas.requestRenderAll();

      this.updateContextToolbar();


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


      this.activeObject =
        this.getActiveObject();


      this.canvas.discardActiveObject();

      this.canvas.requestRenderAll();

      this.hideContextToolbar();


      this.emit(
        "object:removed",
        {
          target: obj
        }
      );


      return obj;
    }


    /* =====================================================
     * SHAPE
     * ===================================================== */

    getActiveShape() {

      const object =
        this.getActiveObject();

      if (!object) {
        return null;
      }


      const shapes = [
        "circle",
        "rect",
        "triangle",
        "ellipse",
        "polygon",
        "polyline",
        "line"
      ];


      return shapes.includes(
        object.type
      )
        ? object
        : null;
    }


    /* =====================================================
     * PAGE
     * ===================================================== */

    resizePage(
      width,
      height
    ) {

      if (!this.canvas) {
        return false;
      }


      width =
        Math.max(
          1,
          Number(width)
        );

      height =
        Math.max(
          1,
          Number(height)
        );


      this.canvas.setDimensions({
        width,
        height
      });


      this.canvas.requestRenderAll();


      this.updateContextToolbar();


      this.emit(
        "page:resized",
        {
          width,
          height
        }
      );


      return true;
    }


    setPageBackground(color) {

      if (!this.canvas) {
        return false;
      }


      this.canvas.setBackgroundColor(
        color,
        () =>
          this.canvas.requestRenderAll()
      );


      return true;
    }


    setPageTransparent() {

      if (!this.canvas) {
        return false;
      }


      this.canvas.setBackgroundColor(
        "transparent",
        () =>
          this.canvas.requestRenderAll()
      );


      return true;
    }


    setPageRatio(
      ratioW,
      ratioH
    ) {

      if (!this.canvas) {
        return false;
      }


      const width =
        this.canvas.getWidth();

      const height =
        width *
        ratioH /
        ratioW;


      return this.resizePage(
        width,
        height
      );
    }


    /* =====================================================
     * SAVE
     * ===================================================== */

    saveAs(
      format = "png",
      quality = "normal"
    ) {

      if (!this.canvas) {
        return false;
      }


      const qualityMap = {
        low: 0.5,
        normal: 0.8,
        high: 1
      };


      const options = {
        format,
        multiplier: 1
      };


      if (format === "jpeg") {

        options.quality =
          qualityMap[quality] ??
          0.8;

        options.backgroundColor =
          this.canvas.backgroundColor ||
          "#ffffff";
      }


      const dataURL =
        this.canvas.toDataURL(
          options
        );


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


    /* =====================================================
     * TEXT
     * ===================================================== */

    createText(
      text = "Text",
      options = {}
    ) {

      if (!this.canvas) {
        return null;
      }


      const {
        left = 100,
        top = 100,
        ...props
      } = options;


      const object =
        new fabric.IText(
          text,
          {
            left,
            top,

            fontFamily: "Arial",
            fontSize: 32,

            fill: "#000000",
            backgroundColor: "",

            charSpacing: 0,
            lineHeight: 1.16,

            ...props
          }
        );


      this.add(
        object,
        true
      );


      return object;
    }


    getActiveText() {

      const object =
        this.getActiveObject();


      if (!object) {
        return null;
      }


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

      const text =
        this.getActiveText();


      if (!text) {
        return null;
      }


      return this.update(
        props,
        text
      );
    }


    /* =====================================================
     * EVENTS
     * ===================================================== */

    _bindEvents() {

      if (!this.canvas) {
        return;
      }


      /* ---------------------------------------------------
       * SELECTION CREATED
       * --------------------------------------------------- */

      this.canvas.on(
        "selection:created",
        () => {

          this.activeObject =
            this.getActiveObject();


          this.showContextToolbar();


          this.emit(
            "selection:changed",
            this.activeObject
          );


          this.openObjectEditor(
            this.activeObject
          );
        }
      );


      /* ---------------------------------------------------
       * SELECTION UPDATED
       * --------------------------------------------------- */

      this.canvas.on(
        "selection:updated",
        () => {

          this.activeObject =
            this.getActiveObject();


          this.showContextToolbar();


          this.emit(
            "selection:changed",
            this.activeObject
          );


          this.openObjectEditor(
            this.activeObject
          );
        }
      );


      /* ---------------------------------------------------
       * SELECTION CLEARED
       * --------------------------------------------------- */

      this.canvas.on(
        "selection:cleared",
        () => {

          this.activeObject = null;

          this.hideContextToolbar();


          this.emit(
            "selection:changed",
            null
          );
        }
      );


      /* ---------------------------------------------------
       * OBJECT MOVING
       * --------------------------------------------------- */

      this.canvas.on(
        "object:moving",
        () => {

          this.updateContextToolbar();
        }
      );


      /* ---------------------------------------------------
       * OBJECT SCALING
       * --------------------------------------------------- */

      this.canvas.on(
        "object:scaling",
        () => {

          this.updateContextToolbar();
        }
      );


      /* ---------------------------------------------------
       * OBJECT ROTATING
       * --------------------------------------------------- */

      this.canvas.on(
        "object:rotating",
        () => {

          this.updateContextToolbar();
        }
      );


      /* ---------------------------------------------------
       * OBJECT MODIFIED
       * --------------------------------------------------- */

      this.canvas.on(
        "object:modified",
        event => {

          this.updateContextToolbar();

          this.emit(
            "object:modified",
            event
          );
        }
      );


      /* ---------------------------------------------------
       * OBJECT ADDED
       * --------------------------------------------------- */

      this.canvas.on(
        "object:added",
        event => {

          this.emit(
            "object:added",
            event
          );
        }
      );


      /* ---------------------------------------------------
       * OBJECT REMOVED
       * --------------------------------------------------- */

      this.canvas.on(
        "object:removed",
        event => {

          this.emit(
            "object:removed",
            event
          );
        }
      );


      /* ---------------------------------------------------
       * MOUSE EVENTS
       * --------------------------------------------------- */

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
    }


    /* =====================================================
     * EVENT API
     * ===================================================== */

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

        this.listeners[eventName] =
          [];
      }


      this.listeners[eventName]
        .push(callback);


      return () => {

        this.off(
          eventName,
          callback
        );
      };
    }


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


    emit(
      eventName,
      data
    ) {

      const listeners =
        this.listeners[eventName];


      if (!listeners) {
        return;
      }


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


  window.ZFB =
    fabric;

})();
