import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem, Combo } from '../../../shared/services/menu.service';

interface ProductForm {
  name: string;
  japaneseName: string;
  description: string;
  price: number;
  category: string;
}

type ProductType = 'platos' | 'combos';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  combos: Combo[] = [];
  activeType: ProductType = 'platos';
  showForm = false;
  editingId: string | null = null;
  itemImagePreview: string | null = null;
  comboImagePreview: string | null = null;

  private readonly DEFAULT_ITEM: ProductForm = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: 'bebidas'
  };

  private readonly DEFAULT_COMBO: ProductForm = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: 'combos'
  };

  private readonly ROMAJI_TO_KATAKANA: { [key: string]: string } = {
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
    'sh': 'シ', 'ch': 'チ', 'ts': 'ツ', 'j': 'ジ', 'z': 'ズ', '-': 'ー'
  };

  newItem: ProductForm = { ...this.DEFAULT_ITEM };
  newCombo: ProductForm = { ...this.DEFAULT_COMBO };
  selectedComboItems: Record<string, boolean> = {};

  constructor(private menuService: MenuService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.menuService.getMenuItems().subscribe(items => {
      this.menuItems = items;
      this.cdr.markForCheck();
    });

    this.menuService.getCombos().subscribe(combos => {
      this.combos = combos;
      this.cdr.markForCheck();
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  editItem(item: MenuItem): void {
    this.editingId = item.id;
    this.activeType = 'platos';
    this.newItem = {
      name: item.name,
      japaneseName: item.japaneseName || '',
      description: item.description,
      price: item.price,
      category: item.category
    };
    this.itemImagePreview = item.image;
    this.showForm = true;
  }

  editCombo(combo: Combo): void {
    this.editingId = combo.id;
    this.activeType = 'combos';
    this.newCombo = {
      name: combo.name,
      japaneseName: combo.japaneseName || '',
      description: combo.description || '',
      price: combo.price,
      category: combo.category || 'combos'
    };
    this.comboImagePreview = combo.image;
    this.selectedComboItems = {};
    combo.items.forEach(item => {
      this.selectedComboItems[item.itemId] = true;
    });
    this.showForm = true;
  }

  switchType(type: ProductType): void {
    this.activeType = type;
    this.showForm = false;
  }

  addItem(): void {
    if (this.activeType === 'platos') {
      this.addPlato();
    } else {
      this.addCombo();
    }
  }

  private addPlato(): void {
    if (!this.newItem.name || !this.newItem.description || this.newItem.price <= 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    const item: MenuItem = {
      id: this.editingId || Date.now().toString(),
      ...this.newItem,
      image: this.itemImagePreview || '/assets/placeholder.png'
    };

    if (this.editingId) {
      this.menuService.updateMenuItem(this.editingId, {
        ...this.newItem,
        image: this.itemImagePreview || '/assets/placeholder.png'
      });
    } else {
      this.menuService.addMenuItem(item);
    }
    this.closeForm();
  }

  private addCombo(): void {
    if (!this.newCombo.name || this.newCombo.price <= 0) {
      alert('Por favor completa el nombre y selecciona platillos para el combo');
      return;
    }

    const selectedItems = this.getSelectedComboItems();
    if (selectedItems.length === 0) {
      alert('Por favor selecciona al menos un platillo para el combo');
      return;
    }

    const combo: Combo = {
      id: this.editingId || Date.now().toString(),
      ...this.newCombo,
      image: this.comboImagePreview || '/assets/placeholder.png',
      items: selectedItems
    };

    if (this.editingId) {
      this.menuService.updateCombo(this.editingId, {
        ...this.newCombo,
        image: this.comboImagePreview || '/assets/placeholder.png',
        items: selectedItems
      });
    } else {
      this.menuService.addCombo(combo);
    }
    this.closeForm();
  }

  private closeForm(): void {
    this.resetForm();
    this.showForm = false;
  }

  get isEditing(): boolean {
    return this.editingId !== null;
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
    this.newItem = { ...this.DEFAULT_ITEM };
    this.newCombo = { ...this.DEFAULT_COMBO };
    this.itemImagePreview = null;
    this.comboImagePreview = null;
    this.selectedComboItems = {};
    this.editingId = null;
  }

  onItemImageSelected(event: Event): void {
    this.readImageFile(event, image => {
      this.itemImagePreview = image;
    });
  }

  onComboImageSelected(event: Event): void {
    this.readImageFile(event, image => {
      this.comboImagePreview = image;
    });
  }

  private readImageFile(event: Event, callback: (image: string) => void): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      callback(result);
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  onItemNameChange(): void {
    this.generateJapaneseName(this.newItem);
  }

  onComboNameChange(): void {
    this.generateJapaneseName(this.newCombo);
  }

  private generateJapaneseName(form: ProductForm): void {
    if (form.name && !form.japaneseName) {
      form.japaneseName = this.transliterateToKatakana(form.name);
    }
  }

  private transliterateToKatakana(text: string): string {
    if (!text) return '';

    const textLower = text.toLowerCase();
    let result = '';
    let i = 0;

    while (i < textLower.length) {
      const twoChar = textLower.substring(i, i + 2);
      if (this.ROMAJI_TO_KATAKANA[twoChar]) {
        result += this.ROMAJI_TO_KATAKANA[twoChar];
        i += 2;
      } else {
        const oneChar = textLower[i];
        result += this.ROMAJI_TO_KATAKANA[oneChar] || (oneChar === ' ' ? ' ' : '');
        i += 1;
      }
    }

    return result;
  }

  toggleComboItem(itemId: string): void {
    this.selectedComboItems[itemId] = !this.selectedComboItems[itemId];
    this.updateComboPrice();
  }

  private updateComboPrice(): void {
    const selectedItems = this.getSelectedMenuItems();
    if (selectedItems.length > 0) {
      const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
      this.newCombo.price = Math.round(totalPrice * 0.9 * 100) / 100;
    }
  }

  private getSelectedMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.selectedComboItems[item.id]);
  }

  private getSelectedComboItems(): Array<{ itemId: string; quantity: number }> {
    return Object.entries(this.selectedComboItems)
      .filter(([_, selected]) => selected)
      .map(([itemId]) => ({ itemId, quantity: 1 }));
  }

  getSelectedComboPrice(): number {
    return this.getSelectedMenuItems().reduce((sum, item) => sum + item.price, 0);
  }
}
