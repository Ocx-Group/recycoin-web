import { Component, OnInit, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TranslateModule } from '@ngx-translate/core';
import { IconsModule } from '@app/shared';

@Component({
    selector: 'app-commissions-balance',
    templateUrl: './commissions-balance.component.html',
    standalone: true,
    imports: [NgxDatatableModule, TranslateModule, IconsModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CommissionsBalanceComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor() {
    this.fetch((data) => {
      this.temp = [...data];
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }
  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/data-commissions-balance.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data and update the rows
    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  ngOnInit(): void {
  }

}
