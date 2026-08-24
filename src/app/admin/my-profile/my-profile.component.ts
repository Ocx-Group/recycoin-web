import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';

import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import {User} from "../../core/models/user-model/user.model";
import {UserService} from "../../core/service/user-service/user.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {
  MyProfileEditPasswordModalComponent
} from "../../client/my-profile/my-profile-edit-password-modal/my-profile-edit-password-modal.component";
import {
  MyProfileEditPersonalInfoModalComponent
} from "../../client/my-profile/my-profile-edit-personal-info-modal/my-profile-edit-personal-info-modal.component";
import {
  MyProfileEditPasswordUploadModalComponent
} from "./my-profile-edit-password-upload-modal/my-profile-edit-password-upload-modal.component";
import {RouterLink} from "@angular/router";

const header = ['Movimientos', 'IP', 'Fecha'];

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    DatatableComponent,
    DataTableColumnDirective,
    MyProfileEditPasswordModalComponent,
    MyProfileEditPersonalInfoModalComponent,
    MyProfileEditPasswordUploadModalComponent,
    DataTableColumnCellDirective,
    RouterLink
  ]
})
export class MyProfileComponent implements OnInit {
  public user: User = new User();
  public userCookie: User;
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private printService: PrintService,
    private clipboardService: ClipboardService,
    private toastr: ToastrService,
  ) {
  }

  @ViewChild('table') table: DatatableComponent;

  ngOnInit(): void {
    this.getCurrentUser();
    this.getUserInfo();
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

  getCurrentUser() {
    let result = localStorage.getItem('currentUserAdmin');
    this.userCookie = JSON.parse(result);
  }

  getUserInfo() {
    this.userService.getUser(this.userCookie).subscribe((response) => {
      if (response.success) {
        this.user = response.data;
      }
    });
  }

  openEditPasswordUploadModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  onPrintPdf() {
    const body = this.temp.map((items: any) => {
      return [items.movements, items.ip, items.date];
    });

    this.printService.print(header, body, 'Últimos Movimientos', false);
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }
}
