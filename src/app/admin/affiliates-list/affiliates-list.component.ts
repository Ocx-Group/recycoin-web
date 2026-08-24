import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { NgClass } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {Router, RouterLink} from '@angular/router';
import Swal from 'sweetalert2';
import { BalanceInformationModalComponent } from './balance-information-modal/balance-information-modal.component';
import {TranslatePipe} from "@ngx-translate/core";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";
import {MatrixActivationModalComponent} from "./matrix-activation/matrix-activation-modal.component";
import {IconsModule} from "../../shared";
import {MakePurchaseModalComponent} from "./make-purchase-modal/make-purchase-modal.component";
import {AffiliatesListEditModalComponent} from "./affiliates-list-edit-modal/affiliates-list-edit-modal.component";
import {AffiliateService} from "../../core/service/affiliate-service/affiliate.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {WalletService} from "../../core/service/wallet-service/wallet.service";
import {WalletModel1AService} from "../../core/service/wallet-model-1a-service/wallet-model-1a.service";
import {WalletModel1BService} from "../../core/service/wallet-model-1b-service/wallet-model-1b.service";
import {UserAffiliate} from "../../core/models/user-affiliate-model/user.affiliate.model";
import {CreditTransactionAdminRequest} from "../../core/models/wallet-model/creditTransactionAdminRequest.mode";
import {PaginationRequest} from "../../core/interfaces/pagination-request";


const header = [
  'Usuario',
  'Estado',
  'Teléfono',
  'Correo',
  'Fecha Registro',
  'Padre',
  'Patrocinador',
  'Patrocinador Binario',
];

@Component({
    selector: 'app-affiliates-list',
    templateUrl: './affiliates-list.component.html',
    providers: [ToastrService],
    standalone: true,
  imports: [
    BalanceInformationModalComponent,
    MatrixActivationModalComponent,
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    MakePurchaseModalComponent,
    AffiliatesListEditModalComponent,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdown,
    DataTableColumnCellDirective,
    NgbDropdownToggle,
    NgClass
]
})
export class AffiliatesListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  totalElements = 0;
  pageSize = 10;
  currentPage = 1;
  searchTerm = '';
  private readonly searchTerms = new Subject<string>();
  @ViewChild(BalanceInformationModalComponent)
  private balanceInformationModalComponent: BalanceInformationModalComponent;
  @ViewChild('table') table: DatatableComponent;
  @ViewChild(MatrixActivationModalComponent)
  private matrixActivationModalComponent: MatrixActivationModalComponent;

  constructor(
    private router: Router,
    private affiliateService: AffiliateService,
    private clipboardService: ClipboardService,
    private toast: ToastrService,
    private printService: PrintService,
    private walletService: WalletService,
    private walletModel1AService: WalletModel1AService,
    private walletModel1BService: WalletModel1BService,
  ) {}

  ngOnInit() {
    this.searchTerms
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(term => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.loadAffiliateList();
      });

    this.loadAffiliateList();
  }

  @HostListener('window:resize')
  onResize() {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  // createOpenModal(content) {
  //   this.modalService.open(content, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     size: 'lg',
  //   });
  // }
  //
  // closeModals() {
  //   this.modalService.dismissAll();
  // }

  loadAffiliateList() {
    const request: PaginationRequest = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage,
      ...(this.searchTerm && { search: this.searchTerm }),
    };

    this.loadingIndicator = true;
    this.affiliateService.getAllPaged(request).subscribe({
      next: response => {
        if (response?.success && response.data) {
          this.rows = response.data.items;
          this.temp = response.data.items;
          this.totalElements = response.data.totalCount;
          this.pageSize = response.data.pageSize;
          this.currentPage = response.data.currentPage;
        }
        this.loadingIndicator = false;
      },
      error: error => {
        console.error(error);
        this.loadingIndicator = false;
        this.showError('Error al cargar los datos');
      },
    });
  }

  onPage(event: any) {
    this.currentPage = event.offset + 1;
    this.loadAffiliateList();
  }

  getRowHeight(row: { height: any }) {
    return row.height;
  }

  updateFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerms.next(target.value.trim());
  }

  formatStatusActivation(row: UserAffiliate) {
    return row.status_activation
      ? row.status_activation.replace(/_/g, ' ')
      : '';
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp && this.temp.length > 0) {
      this.toast.success(`copied ${this.temp.length} rows successfully`);
    } else {
      this.toast.info('no data to copy');
    }
  }

  showSuccess(message: string) {
    this.toast.success(message);
  }

  showError(message: string) {
    this.toast.error(message);
  }

  onPrint() {
    const body = this.temp.map((items: UserAffiliate) => {
      return [
        items.user_name,
        items.status,
        items.phone,
        items.email,
        items.created_at,
        items.father_user_name,
        items.sponsor_user_name,
        items.binary_sponsor_user_name,
      ];
    });

    this.printService.print(header, body, 'Lista de Afiliados', false);
  }

  onRouteUnilevelTree(id: number) {
    this.router.navigate([`admin/unilevel-tree/${id}`]).then();
  }

  onRouteForceGenealogicalTree() {
    this.router.navigate(['admin/force-genealogical-tree']).then();
  }

  onRouteBinaryGenealogicalTree(id: number) {
    this.router.navigate([`admin/binary-genealogical-tree/${id}`]).then();
  }

  confirmationCreateBalance(user: UserAffiliate) {
    Swal.fire({
      title: 'Acreditar Saldo',
      html: `
        <label id="swal-input-label" class="col-red">Usuario: ${user.user_name}</label>
        <br>
        <label for="swal-input-amount">Monto a Acreditar:</label>
        <input id="swal-input-amount" type="number" class="swal2-input" placeholder="Ingrese el monto">
        <br>
        <br>
        <label for="swal-select-type">Elija el saldo a crear:</label>
        <br>
        <br>
        <select id="swal-select-type" class="swal2-input">
          <option value="modelo2">Saldo Disponible Modelo2</option>
        </select>
      `,
      icon: 'info',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const amount = (
          Swal.getPopup().querySelector(
            '#swal-input-amount',
          ) as HTMLInputElement
        ).value;
        const type = (
          Swal.getPopup().querySelector(
            '#swal-select-type',
          ) as HTMLSelectElement
        ).value;
        if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
          Swal.showValidationMessage('Por favor ingrese un monto válido.');
          return false;
        }
        return {
          amount: Number(amount),
          type,
        };
      },
    }).then(result => {
      if (result.isConfirmed && result.value !== false) {
        let creditRequest = new CreditTransactionAdminRequest();
        creditRequest.affiliateId = user.id;
        creditRequest.amount = result.value.amount;

        switch (result.value.type) {
          case 'modelo2':
            this.createAvailableBalance(creditRequest);
            break;
          case 'modelo1a':
            this.createServiceBalanceModel1A(creditRequest);
            break;
          case 'modelo1b':
            this.createServiceBalanceModel1B(creditRequest);
            break;
          default:
            console.error('Tipo de saldo desconocido:', result.value.type);
        }
      }
    });
  }

  createAvailableBalance(request: CreditTransactionAdminRequest) {
    this.walletService.createBalanceAdmin(request).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess('Se ha acreditado el saldo correctamente.');
        } else {
          this.showError('No se pudo crear la transacción');
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  createServiceBalanceModel1A(request: CreditTransactionAdminRequest) {
    this.walletModel1AService.createServiceBalanceAdmin(request).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess('Se ha acreditado el saldo correctamente.');
        } else {
          this.showError('No se pudo crear la transacción');
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  createServiceBalanceModel1B(request: CreditTransactionAdminRequest) {
    this.walletModel1BService.createServiceBalanceAdmin(request).subscribe({
      next: value => {
        if (value.success) {
          this.showSuccess('Se ha acreditado el saldo correctamente.');
        } else {
          this.showError('No se pudo crear la transacción');
        }
      },
      error: () => {
        this.showError('Error');
      },
    });
  }

  openBalanceInformationModal(userAffiliate: UserAffiliate) {
    if (this.balanceInformationModalComponent) {
      this.balanceInformationModalComponent.initModal(userAffiliate);
    }
  }

  openMatrixActivationModal(userAffiliate: UserAffiliate) {
    if (this.matrixActivationModalComponent) {
      this.matrixActivationModalComponent.openModal(userAffiliate);
    }
  }
}
