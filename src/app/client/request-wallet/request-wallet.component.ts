import { ChangeDetectorRef, Component, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import {DatatableComponent, NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {UntypedFormGroup, ReactiveFormsModule} from '@angular/forms';

import {TranslatePipe} from '@ngx-translate/core';
import {IconsModule} from '@app/shared';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-request-wallet',
  templateUrl: './request-wallet.component.html',
  standalone: true,
  imports: [NgxDatatableModule, ReactiveFormsModule, TranslatePipe, IconsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RequestWalletComponent {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  register: UntypedFormGroup;
  newUserImg = 'assets/images/users/user-2.png';

  @ViewChild('table') table: DatatableComponent;

  constructor(private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.fetch(data => {
      this.temp = [...data];
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
        this.cdr.markForCheck();
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
    req.open('GET', `assets/data/datatable-wallet-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
      this.cdr.markForCheck();
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
    this.table.offset.set(0);
  }

  addRow(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.register.patchValue({
      id: this.getId(10, 100),
      img: this.newUserImg,
    });
  }

  getId(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
