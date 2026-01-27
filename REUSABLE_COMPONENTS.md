# Reusable Components Library

This document outlines all the reusable components created for cross-module use across the application.

## Generic Components (Application-Wide Use)

### 1. **DataTableComponent**
- **Location:** `src/app/shared/data-table/`
- **Purpose:** Generic data table with dynamic columns and custom templates
- **Exports:** `DataTableColumn` interface
- **Inputs:**
  - `data: any[]` - Array of data to display
  - `columns: DataTableColumn[]` - Column configuration
  - `title?: string` - Optional table title
  - `emptyTitle?: string` - Empty state title
  - `emptySubtitle?: string` - Empty state subtitle
  - `emptyIcon?: 'user' | 'cart' | 'search' | 'inbox' | 'default'` - Empty state icon
- **Features:**
  - Dynamic column rendering
  - Custom cell templates via ng-template
  - Sticky headers with horizontal scrolling
  - Empty state fallback using EmptyStateComponent
  - Responsive design with hover effects
- **Usage Example:**
  ```typescript
  // In component
  columns: DataTableColumn[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Name', align: 'left' },
    { key: 'amount', header: 'Amount', align: 'right', template: amountTemplate }
  ];
  data = [/* your data */];
  
  // In template
  <app-data-table
    [data]="data"
    [columns]="columns"
    [title]="'Transactions'"
    emptyIcon="inbox">
  </app-data-table>
  ```

### 2. **FilterBarComponent**
- **Location:** `src/app/shared/filter-bar/`
- **Purpose:** Generic dynamic filter bar with multiple field types
- **Exports:** `FilterField`, `FilterOption` interfaces
- **Inputs:**
  - `fields: FilterField[]` - Array of filter field configurations
  - `showResetButton: boolean` - Show/hide reset button (default: true)
- **Outputs:**
  - `filterChange: EventEmitter<Record<string, any>>` - Emits filter values on change
- **Field Types:** select, date, text, number, search
- **Features:**
  - Dynamic field rendering based on configuration
  - Grid layout with customizable column spans
  - Reset button to clear all filters
  - Responsive design
- **Usage Example:**
  ```typescript
  // In component
  filterFields: FilterField[] = [
    { name: 'status', label: 'Status', type: 'select', options: [...], gridSpan: 2 },
    { name: 'date', label: 'Date', type: 'date', gridSpan: 2 },
    { name: 'search', label: 'Search', type: 'search' }
  ];
  
  onFilterChange(filters: Record<string, any>) {
    // Handle filter changes
  }
  
  // In template
  <app-filter-bar
    [fields]="filterFields"
    [showResetButton]="true"
    (filterChange)="onFilterChange($event)">
  </app-filter-bar>
  ```

### 3. **BarChartComponent**
- **Location:** `src/app/shared/bar-chart/`
- **Purpose:** Generic horizontal bar chart with percentage-based heights
- **Exports:** `BarChartData` interface
- **Inputs:**
  - `data: BarChartData[]` - Array of bar data
  - `title?: string` - Chart title
  - `emptyMessage?: string` - Message when data is empty
- **BarChartData Interface:**
  ```typescript
  {
    label: string;        // Bar label
    value: number;        // Numeric value
    percentage: number;   // Height percentage (0-100)
    description?: string; // Optional subtitle
    color?: string;       // Optional CSS color override
  }
  ```
- **Features:**
  - CSS variable based coloring (--bar-color)
  - Percentage-based height visualization
  - Optional descriptions/subtitles
  - EmptyStateComponent fallback
  - Responsive design
- **Usage Example:**
  ```typescript
  chartData: BarChartData[] = [
    { label: 'January', value: 5000, percentage: 75, description: '5,000 USD' },
    { label: 'February', value: 4200, percentage: 63, description: '4,200 USD' }
  ];
  
  // In template
  <app-bar-chart
    [data]="chartData"
    [title]="'Monthly Revenue'"
    emptyMessage="No data available">
  </app-bar-chart>
  ```

### 4. **ChartCardComponent**
- **Location:** `src/app/shared/chart-card/`
- **Purpose:** Generic wrapper container for chart content
- **Inputs:**
  - `title?: string` - Optional card title using SectionHeaderComponent
- **Features:**
  - ng-content projection for flexible chart content
  - Optional section header
  - Consistent styling and padding
  - Responsive layout
- **Usage Example:**
  ```typescript
  // In template
  <app-chart-card [title]="'Revenue Chart'">
    <app-bar-chart [data]="chartData"></app-bar-chart>
  </app-chart-card>
  ```

### 5. **InfoCardsComponent**
- **Location:** `src/app/shared/info-cards/`
- **Purpose:** Display information cards in a responsive grid with badges and actions
- **Exports:** `InfoCard` interface
- **Inputs:**
  - `cards: InfoCard[]` - Array of card data
- **InfoCard Interface:**
  ```typescript
  {
    id?: string;
    title: string;           // Card title
    value: string | number;  // Primary value
    description?: string;    // Optional description
    icon?: string;           // Optional emoji/icon
    color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'pink';
    badge?: string;          // Optional badge text
    action?: () => void;     // Optional action callback
  }
  ```
- **Features:**
  - 6 color variants (blue, green, red, amber, purple, pink)
  - Badge display with color coding
  - Hover animations and effects
  - Responsive grid layout (4 cols desktop, responsive mobile)
  - Action button support
- **Usage Example:**
  ```typescript
  cards: InfoCard[] = [
    { 
      title: 'Total Orders', 
      value: 1,234, 
      color: 'blue',
      badge: '+12%',
      icon: '📦'
    },
    { 
      title: 'Revenue', 
      value: '$45,000', 
      color: 'green',
      badge: '+8%',
      icon: '💰'
    }
  ];
  
  // In template
  <app-info-cards [cards]="cards"></app-info-cards>
  ```

## Module-Specific Components (Can be adapted to generic)

### 6. **IncomeFiltersComponent**
- **Location:** `src/app/shared/income-filters/`
- **Purpose:** Income report specific filters (period, order type, dates, search)
- **Exports:** `PeriodType`, `OrderType` types
- **Inputs:**
  - `periodType: PeriodType` - Current period type
  - `orderType: OrderType` - Current order type
  - `startDate: Date` - Filter start date
  - `endDate: Date` - Filter end date
  - `searchQuery: string` - Search query
- **Outputs:**
  - `periodTypeChange` - Period type changed
  - `orderTypeChange` - Order type changed
  - `dateChange` - Date range changed
  - `search` - Search query changed
  - `export` - Export button clicked
- **Features:**
  - Period type selector (daily, weekly, monthly, yearly)
  - Order type selector (all, pending, completed, failed)
  - Date range picker
  - Search input with export button
- **Usage Example:**
  ```typescript
  // In template
  <app-income-filters
    [periodType]="periodType"
    [orderType]="orderType"
    [startDate]="startDate"
    [endDate]="endDate"
    [searchQuery]="searchQuery"
    (periodTypeChange)="onPeriodTypeChange($event)"
    (orderTypeChange)="onOrderTypeChange($event)"
    (dateChange)="onDateChange($event)"
    (search)="onSearch($event)"
    (export)="onExport()">
  </app-income-filters>
  ```

### 7. **IncomeTableComponent**
- **Location:** `src/app/shared/income-table/`
- **Purpose:** Display income transaction records with formatting
- **Exports:** `IncomeRecord` interface
- **Inputs:**
  - `data: IncomeRecord[]` - Income transaction data
- **Features:**
  - Automatic date formatting (DD/MM/YYYY)
  - Automatic currency formatting (USD)
  - Payment method labels
  - Status badges with colors
  - EmptyStateComponent fallback
- **Usage Example:**
  ```typescript
  // In template
  <app-income-table [data]="incomeRecords"></app-income-table>
  ```

## Integration Guide

### To Use These Components:

1. **Import in your module/component:**
   ```typescript
   import { DataTableComponent } from '@shared/data-table/data-table.component';
   import { FilterBarComponent } from '@shared/filter-bar/filter-bar.component';
   import { BarChartComponent } from '@shared/bar-chart/bar-chart.component';
   import { InfoCardsComponent } from '@shared/info-cards/info-cards.component';
   ```

2. **Add to imports array (if component):**
   ```typescript
   @Component({
     imports: [DataTableComponent, FilterBarComponent, BarChartComponent, InfoCardsComponent]
   })
   ```

3. **Use in templates:**
   ```html
   <app-data-table [data]="data" [columns]="columns"></app-data-table>
   <app-filter-bar [fields]="filterFields" (filterChange)="onFilter($event)"></app-filter-bar>
   <app-bar-chart [data]="chartData"></app-bar-chart>
   <app-info-cards [cards]="cards"></app-info-cards>
   ```

## Modules Ready for Enhancement

The following modules can benefit from these reusable components:

- **Dashboard** - Use DataTableComponent, BarChartComponent, InfoCardsComponent, FilterBarComponent
- **Customers** - Use DataTableComponent, FilterBarComponent, InfoCardsComponent
- **Delivery** - Use DataTableComponent, FilterBarComponent, InfoCardsComponent
- **Kitchen** - Use DataTableComponent, InfoCardsComponent
- **Menu** - Use DataTableComponent, FilterBarComponent
- **Users** - Use DataTableComponent, FilterBarComponent, InfoCardsComponent

## Current Status

✅ All components created and compiled successfully
✅ Income-Report module optimized using reusable components
✅ Ready for integration into other modules
