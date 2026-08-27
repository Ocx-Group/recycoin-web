import { ChangeDetectorRef, AfterViewInit, Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import {
  DataTableColumnCellDirective,
  DataTableColumnDirective,
  DatatableComponent,
  DatatableRowDetailDirective,
  DatatableRowDetailTemplateDirective
} from '@swimlane/ngx-datatable';
import {ResultsEcoPoolService} from "../../core/service/results-ecopool-service/results-ecopool.service";
import {IconsModule} from "../../shared";
import {TranslatePipe} from "@ngx-translate/core";


@Component({
  selector: 'app-results-ecopool',
  templateUrl: './results-ecopool.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatatableComponent, IconsModule, TranslatePipe, DatatableRowDetailDirective, DatatableRowDetailTemplateDirective, DataTableColumnDirective, DataTableColumnCellDirective]
})
export class ResultsEcopoolComponent implements OnInit, AfterViewInit {
  temp = [];
  rows = [];
  expanded: any = {};
  timeout: any;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(private resultsEcoPoolService: ResultsEcoPoolService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.loadResults();
  }

  ngAfterViewInit() {
    this.onResize(event);
    window.addEventListener('resize', this.onResize.bind(this));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows = this.temp.filter(function (d) {
      return d.affiliateName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.table.offset.set(0);
  }

  getRowHeight(row) {
    return row.height;
  }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  loadResults() {
    this.resultsEcoPoolService.getAllResultsEcoPool().subscribe({
      next: (value) => {
        this.temp = [...value];
        this.rows = value;
        this.loadingIndicator = false;
        this.cdr.markForCheck();
      },
      error: () => {
      },
    })
  }
}
