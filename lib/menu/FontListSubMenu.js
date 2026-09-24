class TextSubMenu {
  constructor(zenitsu, params) {
    this.zenitsu = zenitsu;
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'zenitsu-menu-level level-2';

    // Tombol 1: Tambah Teks Baru
    const btnAddText = document.createElement('button');
    btnAddText.textContent = '➕ Add Text';
    btnAddText.onclick = () => this.createNewText();

    // Tombol 2: Navigasi Lanjutan ke List Font
    const btnFontList = document.createElement('button');
    btnFontList.textContent = '🔤 Font List ❯';
    btnFontList.onclick = () => {
      this.zenitsu.navigateTo('font-list-menu');
    };

    this.element.appendChild(btnAddText);
    this.element.appendChild(btnFontList);

    return this.element;
  }

  createNewText() {
    const textObj = new ZFB.IText('Teks Baru', {
      left: 150,
      top: 150,
      fontSize: 24,
      fill: '#333333'
    });
    this.zenitsu.add(textObj);
  }
}

// Mendaftarkan ke Registry
Zenitsu.registerMenu('text-submenu', TextSubMenu);
