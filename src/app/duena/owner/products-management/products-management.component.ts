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
        image: '/assets/placeholder.png'
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
        image: '/assets/placeholder.png',
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
  }

  switchType(type: 'platos' | 'combos'): void {
    this.activeType = type;
    this.showForm = false;
    this.editingId = null;
  }
}
