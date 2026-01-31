import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { MenuService, MenuItem, Combo } from '../../shared/services/menu.service';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { TabsContainerComponent, TabItem } from '../../shared/tabs-container/tabs-container.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ProductCardComponent, ProductCardData } from '../../shared/product-card/product-card.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { MenuItem as SupabaseMenuItem, Combo as SupabaseCombo, Category as SupabaseCategory } from '../../core/services/supabase.service';
import * as MenuItemsActions from '../../store/menu-items/menu-items.actions';
import { selectMenuItems, selectAvailableMenuItems, selectMenuItemsLoadingState } from '../../store/menu-items/menu-items.selectors';
import * as CategoriesActions from '../../store/categories/categories.actions';
import { selectCategories } from '../../store/categories/categories.selectors';
import * as CombosActions from '../../store/combos/combos.actions';
import { selectCombos } from '../../store/combos/combos.selectors';

interface ProductForm {
  name: string;
  japaneseName: string;
  description: string;
  price: number;
  category: string;
}

interface Category {
  id: string;
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
  private subscriptions = new Subscription();
  private isSubmitting = false;

  // Observables del store
  menuItems$: Observable<SupabaseMenuItem[]>;
  menuItemsLoading$: Observable<boolean>;
  categories$: Observable<SupabaseCategory[]>;
  combos$: Observable<SupabaseCombo[]>;

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
    category: ''
  };

  private readonly DEFAULT_COMBO: ProductForm = {
    name: '',
    japaneseName: '',
    description: '',
    price: 0,
    category: ''
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
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializar observables del store
    this.menuItems$ = this.store.select(selectMenuItems);
    this.menuItemsLoading$ = this.store.select(selectMenuItemsLoadingState);
    this.categories$ = this.store.select(selectCategories);
    this.combos$ = this.store.select(selectCombos);
  }

  ngOnInit(): void {
    // Cargar categorías y combos
    this.store.dispatch(CategoriesActions.loadCategories());
    this.store.dispatch(CombosActions.loadCombos());

    // Dispatch para cargar items del menú desde el store
    this.store.dispatch(MenuItemsActions.loadMenuItems());

    // Suscribirse a cambios en menu items desde el store
    this.subscriptions.add(
      this.menuItems$.subscribe(items => {
        this.menuItems = items.map(item => this.mapSupabaseItemToLocal(item));
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.categories$.subscribe(categories => {
        this.categories = categories.map(cat => ({
          id: String(cat.id),
          name: cat.name,
          icon: this.getCategoryIcon(cat.name)
        }));
        this.ensureDefaultCategory();
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.combos$.subscribe(combos => {
        this.combos = combos.map(combo => this.mapSupabaseComboToLocal(combo));
        this.cdr.markForCheck();
      })
    );

    // Suscribirse a cambios en tiempo real
    this.store.dispatch(MenuItemsActions.subscribeToMenuItems());
    this.store.dispatch(CombosActions.subscribeToCombos());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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

  // Métodos eliminados - ahora se usan desde NgRx store
  // loadMenuFromSupabase() y subscribeToMenuChanges() ya no son necesarios

  private ensureDefaultCategory() {
    const defaultCategoryId = this.categories.length > 0 ? this.categories[0].id : '';
    if (!this.newItem.category) {
      this.newItem = { ...this.newItem, category: defaultCategoryId };
    }
    if (!this.newCombo.category) {
      this.newCombo = { ...this.newCombo, category: defaultCategoryId };
    }
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
      category: String(item.category)
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
      category: String(combo.category || '')
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

    if (!this.newItem.category || this.newItem.category === '' || this.newItem.category === '0') {
      alert('Por favor selecciona una categoría válida');
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    console.log('🔍 Saving with category ID:', this.newItem.category, 'Type:', typeof this.newItem.category);

    const menuItemPayload = {
      name: this.newItem.name,
      description: this.newItem.description,
      price: this.newItem.price,
      category_id: this.newItem.category,
      image_url: this.itemImagePreview || undefined
    };

    if (this.editingId) {
      this.store.dispatch(
        MenuItemsActions.updateMenuItem({
          menuItemId: this.editingId,
          menuItem: menuItemPayload
        })
      );
    } else {
      this.store.dispatch(
        MenuItemsActions.createMenuItem({
          menuItem: {
            ...menuItemPayload,
            available: true
          }
        })
      );
    }

    this.closeForm();
    this.isSubmitting = false;
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

    const itemIds = selectedItems.map(item => item.itemId);
    const comboPayloadUpdate = {
      name: this.newCombo.name,
      japanese_name: this.newCombo.japaneseName,
      description: this.newCombo.description,
      price: this.newCombo.price,
      image_url: this.comboImagePreview || undefined
    };

    if (this.editingId) {
      this.store.dispatch(
        CombosActions.updateCombo({
          comboId: this.editingId,
          combo: comboPayloadUpdate,
          itemIds
        })
      );
    } else {
      this.store.dispatch(
        CombosActions.createCombo({
          combo: {
            ...comboPayloadUpdate,
            available: true
          },
          itemIds
        })
      );
    }

    this.closeForm();
    this.isSubmitting = false;
  }

  private closeForm(): void {
    this.showForm = false;
    this.resetForm();
    this.cdr.markForCheck();
  }

  get isEditing(): boolean {
    return this.editingId !== null;
  }

  async deleteItem(id: string): Promise<void> {
    if (!confirm('¿Eliminar este plato?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(MenuItemsActions.deleteMenuItem({ menuItemId: id }));
    this.isSubmitting = false;
  }

  async deleteCombo(id: string): Promise<void> {
    if (!confirm('¿Eliminar este combo?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(CombosActions.deleteCombo({ comboId: id }));
    this.isSubmitting = false;
  }

  resetForm(): void {
    // Set first available category as default
    const defaultCategoryId = this.categories.length > 0 ? this.categories[0].id : '';

    this.newItem = {
      ...this.DEFAULT_ITEM,
      category: defaultCategoryId
    };
    this.newCombo = {
      ...this.DEFAULT_COMBO,
      category: defaultCategoryId
    };
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
