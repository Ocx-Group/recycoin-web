import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IconsModule } from '@app/shared';
import { ReusableDatatableComponent, TableColumn, TableAction, TableConfig } from '@app/shared/components/reusable-datatable/reusable-datatable.component';

@Component({
    selector: 'app-billing-orders',
    templateUrl: './billing-orders.component.html',
    standalone: true,
    imports: [RouterModule, TranslateModule, IconsModule, ReusableDatatableComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BillingOrdersComponent implements OnInit {

  rows = [];
  loadingIndicator = true;

  // Configuración de columnas
  columns: TableColumn[] = [];

  // Configuración de acciones
  actions: TableAction[] = [];

  // Configuración de la tabla
  tableConfig: TableConfig = {
    showSearch: true,
    showActions: false,
    searchPlaceholder: 'BILLING-ORDERS-PAGE.SEARCH.TEXT',
    limit: 10,
    columnMode: 'force',
    reorderable: true
  };

  constructor() {
    this.initializeColumns();
    this.initializeActions();
    this.loadData();
  }

  ngOnInit(): void {
  }

  private initializeColumns(): void {
    this.columns = [
      {
        name: 'BILLING-ORDERS-PAGE.ROW-DATE.TEXT',
        prop: 'date',
        sortable: true
      },
      {
        name: 'BILLING-ORDERS-PAGE.ROW-ORDER.TEXT',
        prop: 'numOrder',
        sortable: true
      },
      {
        name: 'BILLING-ORDERS-PAGE.ROW-PAY-METHOD.TEXT',
        prop: 'paymentMethod',
        sortable: true
      },
      {
        name: 'BILLING-ORDERS-PAGE.ROW-BANK.TEXT',
        prop: 'bank',
        sortable: true
      },
      {
        name: 'BILLING-ORDERS-PAGE.ROW-STATE.TEXT',
        prop: 'status',
        sortable: true
      },
      {
        name: 'BILLING-ORDERS-PAGE.ROW-CONDITION.TEXT',
        prop: 'status',
        sortable: true
      }
    ];
  }

  private initializeActions(): void {
    this.actions = [
      {
        label: 'BILLING-ORDERS-PAGE.BTN-SEE-DETAILS.TEXT',
        icon: 'bi bi-folder2-open',
        callback: (row: any) => this.viewDetails(row),
        class: 'text-primary'
      }
    ];
  }

  private loadData(): void {
    this.fetch((data) => {
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  private fetch(cb: (data: any) => void): void {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/datatable-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  viewDetails(row: any): void {
    console.log('Ver detalles de la orden:', row);
  }

  onRowClicked(row: any): void {
    console.log('Fila clickeada:', row);
  }

  onFilterChanged(filterValue: string): void {
    console.log('Filtro aplicado:', filterValue);
  }

}
