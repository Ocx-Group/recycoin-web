import {
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TranslatePipe } from '@ngx-translate/core';
import { IconsModule } from '@app/shared';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem } from '@ng-bootstrap/ng-bootstrap';

export interface TableColumn {
  name: string;
  prop?: string;
  sortable?: boolean;
  canAutoResize?: boolean;
  draggable?: boolean;
  resizeable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  cellTemplate?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
  pipe?: any;
}

export interface TableAction {
  label: string;
  icon?: string;
  callback: (row: any) => void;
  condition?: (row: any) => boolean;
  class?: string;
}

export interface TableConfig {
  showSearch?: boolean;
  showActions?: boolean;
  showPagination?: boolean;
  searchPlaceholder?: string;
  headerHeight?: number;
  footerHeight?: number;
  rowHeight?: number | string;
  limit?: number;
  columnMode?: 'standard' | 'flex' | 'force';
  reorderable?: boolean;
  swapColumns?: boolean;
  cssClasses?: {
    sortAscending?: string;
    sortDescending?: string;
    sortUnset?: string;
    pagerLeftArrow?: string;
    pagerRightArrow?: string;
    pagerPrevious?: string;
    pagerNext?: string;
  };
  messages?: {
    emptyMessage?: string;
    totalMessage?: string;
    selectedMessage?: string;
    ariaFirstPageMessage?: string;
    ariaPageNMessage?: string;
    ariaPreviousPageMessage?: string;
    ariaNextPageMessage?: string;
    ariaLastPageMessage?: string;
  };
}

@Component({
  selector: 'app-reusable-datatable',
  standalone: true,
  imports: [CommonModule, NgxDatatableModule, TranslatePipe, IconsModule, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem],
  templateUrl: './reusable-datatable.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./reusable-datatable.component.scss']
})
export class ReusableDatatableComponent implements OnInit, OnChanges {
  @Input() rows: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() config: TableConfig = {};
  @Input() loadingIndicator: boolean = false;
  @Input() customButtons: TemplateRef<any>;
  @Input() customSearch: TemplateRef<any>;

  @Output() rowClicked = new EventEmitter<any>();
  @Output() rowSelected = new EventEmitter<any[]>();
  @Output() filterChanged = new EventEmitter<string>();

  @ViewChild('table') table: DatatableComponent;
  @ContentChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  temp: any[] = [];
  scrollBarHorizontal = window.innerWidth < 1200;

  // Configuración por defecto
  defaultConfig: TableConfig = {
    showSearch: true,
    showActions: true,
    showPagination: true,
    searchPlaceholder: 'Buscar...',
    headerHeight: 50,
    footerHeight: 50,
    rowHeight: 'auto',
    limit: 10,
    columnMode: 'force',
    reorderable: true,
    swapColumns: true,
    cssClasses: {
      sortAscending: 'datatable-icon-up',
      sortDescending: 'datatable-icon-down',
      sortUnset: 'datatable-icon-sort-unset',
      pagerLeftArrow: 'datatable-icon-left',
      pagerRightArrow: 'datatable-icon-right',
      pagerPrevious: 'datatable-icon-prev',
      pagerNext: 'datatable-icon-skip'
    },
    messages: {
      emptyMessage: 'No hay datos para mostrar',
      totalMessage: 'total',
      selectedMessage: 'seleccionado'
    }
  };

  mergedConfig: TableConfig = { ...this.defaultConfig };


  ngOnInit(): void {
    // Merge de configuraciones
    this.mergedConfig = {
      ...this.defaultConfig,
      ...this.config,
      messages: {
        ...this.defaultConfig.messages,
        ...(this.config?.messages)
      },
      cssClasses: {
        ...this.defaultConfig.cssClasses,
        ...(this.config?.cssClasses)
      }
    };

    this.temp = [...this.rows];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] && !changes['rows'].firstChange) {
      this.temp = [...this.rows];
    }
    if (changes['config'] && !changes['config'].firstChange) {
      this.mergedConfig = {
        ...this.defaultConfig,
        ...this.config,
        messages: {
          ...this.defaultConfig.messages,
          ...(this.config?.messages)
        },
        cssClasses: {
          ...this.defaultConfig.cssClasses,
          ...(this.config?.cssClasses)
        }
      };
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    if (this.table) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    if (val === '') {
      this.rows = [...this.temp];
    } else {
      // Filtrado genérico por todas las propiedades del objeto
      this.rows = this.temp.filter((item) => {
        return Object.keys(item).some((key) => {
          const value = item[key];
          return value != null && value.toString().toLowerCase().includes(val);
        });
      });
    }

    this.filterChanged.emit(val);

    if (this.table) {
      this.table.offset.set(0);
    }
  }

  onRowClick(event: any) {
    this.rowClicked.emit(event.row);
  }

  onSelect(event: any) {
    this.rowSelected.emit(event.selected);
  }

  executeAction(action: TableAction, row: any) {
    if (action.callback) {
      action.callback(row);
    }
  }

  shouldShowAction(action: TableAction, row: any): boolean {
    return action.condition ? action.condition(row) : true;
  }

  getCellValue(row: any, column: TableColumn): any {
    if (column.prop) {
      return this.getNestedProperty(row, column.prop);
    }
    return null;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  }

  copyTableData() {
    const tableData = this.rows.map(row => {
      const rowData: any = {};
      for (const col of this.columns) {
        if (col.prop) {
          rowData[col.name] = this.getCellValue(row, col);
        }
      }
      return rowData;
    });

    const text = JSON.stringify(tableData, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      console.log('Datos copiados al portapapeles');
    });
  }

  printTable() {
    globalThis.print();
  }

  exportToCSV() {
    const headers = this.columns.map(col => col.name).join(',');
    const rows = this.rows.map(row => {
      return this.columns.map(col => {
        const value = this.getCellValue(row, col);
        return value === null || value === undefined ? '' : `"${value}"`;
      }).join(',');
    }).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'export.csv';
    link.click();
    globalThis.URL.revokeObjectURL(url);
  }
}

