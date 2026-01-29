import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem, Combo } from '../../shared/services/menu.service';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { TabsContainerComponent, TabItem } from '../../shared/tabs-container/tabs-container.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ProductCardComponent, ProductCardData } from '../../shared/product-card/product-card.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { SupabaseService, MenuItem as SupabaseMenuItem, Combo as SupabaseCombo } from '../../core/services/supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ProductForm {
  name: string;
  japaneseName: string;
  description: string;
  price: number;
  category: number;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

type ProductType = 'platos' | 'combos';

@Component({
  selector: 'app-products-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    TabsContainerComponent,
    EmptyStateComponent,
    ProductCardComponent,
    ModalComponent
  ],
  templateUrl: './products-management.component.html',
  styleUrls: ['./products-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsManagementComponent implements OnInit, OnDestroy {
  private menuSubscription: RealtimeChannel | null = null;
  private comboSubscription: RealtimeChannel | null = null;
  private isSubmitting = false;
  menuItems: MenuItem[] = [];
  combos: Combo[] = [];
  categories: Category[] = [];
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
    category: 0
  };

  private readonly DEFAULT_COMBO: ProductForm = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: 1
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

  readonly pageAction: PageAction = {
    label: 'Nuevo Producto',
    icon: '+'
  };

  readonly tabs: TabItem[] = [
    { id: 'platos', label: 'Platos', icon: '🍜' },
    { id: 'combos', label: 'Combos', icon: '📦' }
  ];

  constructor(
    private menuService: MenuService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategoriesFromSupabase();
    this.loadMenuFromSupabase();
    this.subscribeToMenuChanges();
    this.loadCombosFromSupabase();
    this.subscribeToCombosChanges();
  }

  ngOnDestroy() {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    if (this.comboSubscription) {
      this.comboSubscription.unsubscribe();
    }
  }

  async loadCategoriesFromSupabase() {
    try {
      console.log('📋 Loading categories from Supabase...');
      const supabaseCategories = await this.supabase.getCategories();
      this.categories = supabaseCategories.map(cat => ({
        id: Number(cat.id),
        name: cat.name,
        icon: this.getCategoryIcon(cat.name)
      }));
      console.log('✅ Categories loaded:', this.categories);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      alert('Error al cargar categorías: ' + (error as any).message);
    }
  }

  private getCategoryIcon(categoryName: string): string {
    const icons: Record<string, string> = {
      'bebidas': '🥤',
      'rolls': '🍜',
      'nigiri': '🍣',
      'sashimi': '🍱',
      'especiales': '⭐',
      'postres': '🍰',
      'combos': '📦'
    };
    return icons[categoryName.toLowerCase()] || '🍽️';
  }

  async loadMenuFromSupabase() {
    try {
      console.log('📋 Loading menu items from Supabase...');
      const supabaseItems = await this.supabase.getMenuItems();
      console.log('✅ Menu items loaded:', supabaseItems);

      this.menuItems = supabaseItems.map(item => this.mapSupabaseItemToLocal(item));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading menu items:', error);
      alert('Error al cargar platillos: ' + (error as any).message);
    }
  }

  subscribeToMenuChanges() {
    this.menuSubscription = this.supabase.subscribeToMenuItems((items) => {
      console.log('🔄 Menu items updated via subscription');
      this.menuItems = items.map(item => this.mapSupabaseItemToLocal(item));
      this.cdr.markForCheck();
    });
  }

  async loadCombosFromSupabase() {
    try {
      console.log('📋 Loading combos from Supabase...');
      const supabaseCombos = await this.supabase.getCombos();
      console.log('✅ Combos loaded:', supabaseCombos);

      this.combos = supabaseCombos.map(combo => this.mapSupabaseComboToLocal(combo));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading combos:', error);
      alert('Error al cargar combos: ' + (error as any).message);
    }
  }

  subscribeToCombosChanges() {
    this.comboSubscription = this.supabase.subscribeToComboChanges((combos) => {
      console.log('🔄 Combos updated via subscription');
      this.combos = combos.map(combo => this.mapSupabaseComboToLocal(combo));
      this.cdr.markForCheck();
    });
  }

  private mapSupabaseComboToLocal(supabaseCombo: SupabaseCombo): Combo {
    return {
      id: supabaseCombo.id.toString(),
      name: supabaseCombo.name,
      japaneseName: supabaseCombo.japanese_name,
      description: supabaseCombo.description,
      price: supabaseCombo.price,
      image: supabaseCombo.image_url || '/assets/placeholder.png',
      category: 'combos',
      items: []
    };
  }

  private mapSupabaseItemToLocal(supabaseItem: SupabaseMenuItem): MenuItem {
    return {
      id: supabaseItem.id.toString(),
      name: supabaseItem.name,
      description: supabaseItem.description,
      price: supabaseItem.price,
      image: supabaseItem.image_url || '/assets/placeholder.png',
      category: supabaseItem.category_id
    };
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
      category: typeof item.category === 'string' ? Number(item.category) : item.category
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
      category: typeof combo.category === 'string' ? Number(combo.category) : combo.category || 1
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

  onTabChange = (tabId: string): void => {
    this.switchType(tabId as ProductType);
  };

  addItem(): void {
    if (this.activeType === 'platos') {
      this.addPlato();
    } else {
      this.addCombo();
    }
  }

  private async addPlato(): Promise<void> {
    if (!this.newItem.name || !this.newItem.description || this.newItem.price <= 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!this.newItem.category || this.newItem.category === 0 || isNaN(this.newItem.category)) {
      alert('Por favor selecciona una categoría válida');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      const categoryId = String(this.newItem.category);
      console.log('🔍 Saving with category ID:', categoryId, 'Type:', typeof categoryId);

      if (this.editingId) {
        await this.supabase.updateMenuItem(this.editingId, {
          name: this.newItem.name,
          description: this.newItem.description,
          price: this.newItem.price,
          category_id: categoryId,
          image_url: this.itemImagePreview || undefined
        });
        console.log('✅ Menu item updated');
      } else {
        await this.supabase.createMenuItem({
          name: this.newItem.name,
          description: this.newItem.description,
          price: this.newItem.price,
          category_id: categoryId,
          image_url: this.itemImagePreview || undefined,
          available: true
        });
        console.log('✅ Menu item created');
      }
      this.closeForm();
    } catch (error) {
      console.error('❌ Error saving menu item:', error);
      alert('Error al guardar platillo: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async addCombo(): Promise<void> {
    if (!this.newCombo.name || this.newCombo.price <= 0) {
      alert('Por favor completa el nombre y precio del combo');
      return;
    }

    const selectedItems = this.getSelectedComboItems();
    if (selectedItems.length === 0) {
      alert('Por favor selecciona al menos un platillo para el combo');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      const itemIds = selectedItems.map(item => item.itemId);

      if (this.editingId) {
        await this.supabase.updateCombo(this.editingId, {
          name: this.newCombo.name,
          japanese_name: this.newCombo.japaneseName,
          description: this.newCombo.description,
          price: this.newCombo.price,
          image_url: this.comboImagePreview || undefined
        }, itemIds);
        console.log('✅ Combo updated');
      } else {
        await this.supabase.createCombo({
          name: this.newCombo.name,
          japanese_name: this.newCombo.japaneseName,
          description: this.newCombo.description,
          price: this.newCombo.price,
          image_url: this.comboImagePreview || undefined,
          available: true
        }, itemIds);
        console.log('✅ Combo created');
      }
      this.closeForm();
    } catch (error) {
      console.error('❌ Error saving combo:', error);
      alert('Error al guardar combo: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
    }
  }

  private closeForm(): void {
    this.resetForm();
    this.showForm = false;
  }

  get isEditing(): boolean {
    return this.editingId !== null;
  }

  async deleteItem(id: string): Promise<void> {
    if (!confirm('¿Eliminar este plato?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      await this.supabase.deleteMenuItem(id);
      console.log('✅ Menu item deleted');
    } catch (error) {
      console.error('❌ Error deleting menu item:', error);
      alert('Error al eliminar platillo: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteCombo(id: string): Promise<void> {
    if (!confirm('¿Eliminar este combo?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      await this.supabase.deleteCombo(id);
      console.log('✅ Combo deleted');
    } catch (error) {
      console.error('❌ Error deleting combo:', error);
      alert('Error al eliminar combo: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
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
    // El precio ahora se establece manualmente por el usuario
  }

  private updateComboPrice(): void {
    // Función mantenida para compatibilidad, pero ya no se usa automáticamente
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
