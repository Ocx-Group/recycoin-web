import {Component, ViewChild, HostListener, ChangeDetectionStrategy} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-news-admin',
  templateUrl: './walkways-benches.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    TranslatePipe,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu
  ]
})
export class WalkwaysBenchesComponent {
  rows = [];
  loadingIndicator = true;
  active = 1;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  @ViewChild('table') table: DatatableComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }
}
