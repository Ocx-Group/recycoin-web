import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {WalletRequestService} from "../../core/service/wallet-request/wallet-request.service";
import {WalletService} from "../../core/service/wallet-service/wallet.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-authorize-returns',
  templateUrl: './authorize-returns.component.html',
  standalone: true,
  imports: [CommonModule, DatatableComponent, TranslatePipe, RouterLink, IconsModule, DataTableColumnDirective, DataTableColumnCellDirective, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem],
})
export class AuthorizeReturnsComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private walletRequestService: WalletRequestService,
    private toastr: ToastrService,
    private walletService: WalletService) {
  }

  ngOnInit(): void {
    this.loadRequestRevertTransaction();
  }

  showSuccess(message) {
    this.toastr.success(message);
  }

  showError(message) {
    this.toastr.error(message);
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return d.adminUserName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  loadRequestRevertTransaction() {
    this.walletRequestService.getAllWalletRequestRevertTransaction().subscribe({
      next: (value) => {
        this.rows = [...value]
        this.temp = value;
        this.loadingIndicator = false;
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  approveRevertTransaction(row) {
    this.walletService.rejectOrCancelRevertDebitTransaction(1, row.invoiceNumber).subscribe({
      next: (value) => {
        this.showSuccess('La solicitud fue aprobada correctamente.');
        this.loadRequestRevertTransaction();
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  denyRevertTransaction(row) {
    this.walletService.rejectOrCancelRevertDebitTransaction(0, row.invoiceNumber).subscribe({
      next: (value) => {
        this.showSuccess('La solicitud fue rechazada correctamente.');
        this.loadRequestRevertTransaction();
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }

  confirmTransaction(option, row) {
    return Swal.fire({
      title: '¿Está seguro que desea realizar la solicitud?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        if (option === 1) {
          this.approveRevertTransaction(row);
        } else if (option === 0) {
          this.denyRevertTransaction(row);
        }
      }
    });
  }
}
