import {Component, ViewChild, HostListener, ChangeDetectionStrategy} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import {ClipboardService} from 'ngx-clipboard';
import {TranslatePipe} from "@ngx-translate/core";
import {IconsModule} from "../../shared";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-commissions-paid',
  templateUrl: './commissions-paid.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    IconsModule,
    RouterLink,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class CommissionsPaidComponent {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(private toastr: ToastrService, private clipboardService: ClipboardService) {
    this.fetch((data) => {
      this.temp = [...data];
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }

  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/admin/commissions-paid-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset.set(0);
  }

  clipBoardCopy() {
    var string = JSON.stringify(this.temp);
    var result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }
}
