import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {ClipboardService} from 'ngx-clipboard';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {WalletService} from "../../core/service/wallet-service/wallet.service";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";


@Component({
  selector: 'app-balance-of-wallet',
  templateUrl: './balance-of-wallet.component.html',
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
]
})
export class BalanceOfWalletComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private walletService: WalletService,
    private clipboardService: ClipboardService,
    private toastr: ToastrService,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.loadWalletBalance();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  loadWalletBalance() {
    this.walletService.getAllWallets().subscribe(resp => {
      if (resp != null) {
        this.temp = [...resp];
        this.rows = resp;
        this.loadingIndicator = false;
      }
    });
  }

  getRowHeight(row) {
    return row.height;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const searchFields = [
      'affiliateUserName',
      'credit',
      'debit',
      'concept',
      'detail',
    ];

    this.rows = this.temp.filter(d => {
      return searchFields.some(field => {
        const fieldValue = d[field]?.toString().toLowerCase() || '';
        return fieldValue.includes(val);
      });
    });
    this.table.offset = 0;
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    const result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else if (result) {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    } else {
      this.toastr.error('Failed to copy data to clipboard');
    }
  }

  onPrint() {
    const DATA = document.getElementById('htmlTable');
    const today = new Date();

    html2canvas(DATA).then(canvas => {
      let pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Movimientos de mi billetera', pageWidth / 2, 20, {
        align: 'center',
      });

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);

      const formattedDate = today
        .toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(/[/:]/g, '-')
        .replace(', ', '_');

      pdf.save(`movimientos_billetera_${formattedDate}.pdf`);
    });
  }

  showDetail(detail: string) {
    Swal.fire({
      title: this.translateService.instant('WALLET-PAGE.DETAILS-COLUMN.TEXT'),
      text: detail,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      showCancelButton: false,
      allowOutsideClick: false,
      backdrop: true,
      customClass: {
        popup: 'swal-popup',
        container: 'swal-container',
      },
    }).then(result => {
      if (result.isConfirmed) {
        /*empty*/
      }
    });
  }
}
