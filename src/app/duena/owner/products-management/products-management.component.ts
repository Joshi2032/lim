import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem, Combo } from '../../../shared/services/menu.service';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.scss']
})
export class ProductsManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  combos: Combo[] = [];
  activeType: 'platos' | 'combos' = 'platos';
  showForm = false;
  editingId: string | null = null;
  itemImagePreview: string | null = null;
  comboImagePreview: string | null = null;

  newItem = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: 'bebidas'
  };

  newCombo = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: 'combos'
  };

  constructor(private menuService: MenuService, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(items => {
      this.menuItems = items;
      this.changeDetectorRef.markForCheck();
    });

    this.menuService.getCombos().subscribe(combos => {
      this.combos = combos;
      this.changeDetectorRef.markForCheck();
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.editingId = null;
    this.resetForm();
  }

  addItem(): void {
    if (this.activeType === 'platos') {
      if (!this.newItem.name || !this.newItem.description || this.newItem.price <= 0) {
        alert('Por favor completa todos los campos');
        return;
      }

      const item: MenuItem = {
        id: Date.now().toString(),
        ...this.newItem,
        image: this.itemImagePreview || '/assets/placeholder.png'
      };

      this.menuService.addMenuItem(item);
      this.resetForm();
      this.showForm = false;
    } else {
      if (!this.newCombo.name || !this.newCombo.description || this.newCombo.price <= 0) {
        alert('Por favor completa todos los campos');
        return;
      }

      const combo: Combo = {
        id: Date.now().toString(),
        ...this.newCombo,
        image: this.comboImagePreview || '/assets/placeholder.png',
        items: []
      };

      this.menuService.addCombo(combo);
      this.resetForm();
      this.showForm = false;
    }
  }

  deleteItem(id: string): void {
    if (confirm('¿Eliminar este plato?')) {
      this.menuService.deleteMenuItem(id);
    }
  }

  deleteCombo(id: string): void {
    if (confirm('¿Eliminar este combo?')) {
      this.menuService.deleteCombo(id);
    }
  }

  resetForm(): void {
    this.newItem = { name: '', japaneseName: '', description: '', price: 0, category: 'bebidas' };
    this.newCombo = { name: '', japaneseName: '', description: '', price: 0, category: 'combos' };
    this.itemImagePreview = null;
    this.comboImagePreview = null;
  }

  switchType(type: 'platos' | 'combos'): void {
    this.activeType = type;
    this.showForm = false;
    this.editingId = null;
  }

  onItemImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.itemImagePreview = e.target?.result as string;
        this.changeDetectorRef.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  onComboImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.comboImagePreview = e.target?.result as string;
        this.changeDetectorRef.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  // Función para transliterar a katakana
  private transliterateToKatakana(text: string): string {
    if (!text) return '';

    const romajiToKatakana: { [key: string]: string } = {
      'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
      'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
      'sa': 'サ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
      'ta': 'タ', 'ti': 'チ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',
      'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
      'ha': 'ハ', 'hi': 'ヒ', 'hu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
      'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
      'ya': 'ヤ', 'yu': 'ユ', 'yo': 'ヨ',
      'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
      'wa': 'ワ', 'wi': 'ウィ', 'we': 'ウェ', 'wo': 'ウォ', 'n': 'ン',
      'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
      'za': 'ザ', 'zi': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
      'da': 'ダ', 'di': 'ディ', 'du': 'ドゥ', 'de': 'デ', 'do': 'ド',
      'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
      'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
      'fa': 'ファ', 'fi': 'フィ', 'fe': 'フェ', 'fo': 'フォ',
      'va': 'ヴァ', 'vi': 'ヴィ', 'vu': 'ヴ', 've': 'ヴェ', 'vo': 'ヴォ',
      'sh': 'シ', 'ch': 'チ', 'ts': 'ツ', 'j': 'ジ', 'z': 'ズ',
      '-': 'ー'
    };

    const text_lower = text.toLowerCase();
    let result = '';
    let i = 0;

    while (i < text_lower.length) {
      // Intenta 2 caracteres primero
      const twoChar = text_lower.substring(i, i + 2);
      if (romajiToKatakana[twoChar]) {
        result += romajiToKatakana[twoChar];
        i += 2;
      } else {
        // Intenta 1 carácter
        const oneChar = text_lower[i];
        if (romajiToKatakana[oneChar]) {
          result += romajiToKatakana[oneChar];
        } else if (oneChar === ' ') {
          result += ' ';
        } else {
          // Caracteres no reconocidos se ignoran o se pueden mapear a vocales
          result += romajiToKatakana[oneChar] || '';
        }
        i += 1;
      }
    }

    return result;
  }

  onItemNameChange(): void {
    if (this.newItem.name && !this.newItem.japaneseName) {
      this.newItem.japaneseName = this.transliterateToKatakana(this.newItem.name);
    }
  }

  onComboNameChange(): void {
    if (this.newCombo.name && !this.newCombo.japaneseName) {
      this.newCombo.japaneseName = this.transliterateToKatakana(this.newCombo.name);
    }
  }
}
