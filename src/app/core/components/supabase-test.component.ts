import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-supabase-test',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: monospace;">
      <h2>Supabase Connection Test</h2>
      <button (click)="testConnection()">Test Connection</button>
      <button (click)="testMenuItems()">Test Menu Items</button>
      <button (click)="testOrders()">Test Orders</button>
      <pre>{{ testResults }}</pre>
    </div>
  `
})
export class SupabaseTestComponent implements OnInit {
  testResults = '';

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    console.log('SupabaseTestComponent initialized');
  }

  async testConnection() {
    this.testResults = 'Testing connection...\n';
    try {
      const items = await this.supabase.getMenuItems();
      this.testResults += `✅ Connection successful!\n`;
      this.testResults += `Retrieved ${items.length} menu items\n`;
      this.testResults += JSON.stringify(items.slice(0, 2), null, 2);
    } catch (error: any) {
      this.testResults += `❌ Connection failed!\n`;
      this.testResults += error.message;
    }
  }

  async testMenuItems() {
    this.testResults = 'Testing menu items...\n';
    try {
      const items = await this.supabase.getMenuItems();
      this.testResults += `Retrieved ${items.length} items\n`;
      items.forEach(item => {
        this.testResults += `- ${item.name} ($${item.price})\n`;
      });
    } catch (error: any) {
      this.testResults += `Error: ${error.message}`;
    }
  }

  async testOrders() {
    this.testResults = 'Testing orders...\n';
    try {
      const orders = await this.supabase.getOrders();
      this.testResults += `Retrieved ${orders.length} orders\n`;
      orders.forEach(order => {
        this.testResults += `- Order ${order.order_number} for ${order.customer_name}\n`;
      });
    } catch (error: any) {
      this.testResults += `Error: ${error.message}`;
    }
  }
}
