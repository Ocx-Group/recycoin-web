import { ChangeDetectorRef, AfterViewInit, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {SplitBalancesModalComponent} from './split-balances-modal/split-balances-modal.component';
import Swal from 'sweetalert2';
import {ToastrService} from 'ngx-toastr';
import {InvoiceModelOneTwo} from "../../core/models/invoice-model/invoice-model-one-two";
import {InvoiceService} from "../../core/service/invoice-service/invoice.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {IconsModule} from "../../shared";


@Component({
  selector: 'app-change-model',
  templateUrl: './change-model.component.html',
  styleUrls: ['./change-model.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    RouterLink,
    FormsModule,
    DataTableColumnDirective,
    SplitBalancesModalComponent,
    DatatableComponent,
    IconsModule,
    DataTableColumnCellDirective
]
})
export class ChangeModelComponent implements OnInit, AfterViewInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  @ViewChild('table') table: DatatableComponent;
  searchField: any;
  selectedInvoices: InvoiceModelOneTwo[] = [];
  @ViewChild(SplitBalancesModalComponent) private splitBalanceModalComponent: SplitBalancesModalComponent;

  constructor(private invoiceService: InvoiceService, private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.loadAllInvoicesForModelOneAndTwo();
    this.loadingIndicator = false;
  }

  ngAfterViewInit(): void {
    this.splitBalanceModalComponent.reloadRequested.subscribe(() => {
      this.loadAllInvoicesForModelOneAndTwo();
    });
  }

  openModal() {
    if (this.selectedInvoices.length === 0) {
      this.showMessage('Debe seleccionar al menos una factura para poder continuar.');
      return;
    }

    if (this.splitBalanceModalComponent && this.verifySameAffiliateInvoices()) {
      this.splitBalanceModalComponent.setInvoices(this.selectedInvoices);
      this.splitBalanceModalComponent.initModal();
    }
  }

  onSelect({selected}: any) {
    this.selectedInvoices.splice(0, this.selectedInvoices.length);
    this.selectedInvoices.push(...selected);
  }

  verifySameAffiliateInvoices() {
    const currentUserName = this.selectedInvoices[0].userName;
    const result = this.selectedInvoices.every(invoice => invoice.userName === currentUserName);

    if (!result) {
      this.showMessage('No se pueden seleccionar facturas de diferentes afiliados.');
    }

    return result;
  }

  showMessage(message: string) {
    Swal.fire({
      title: 'Atención!',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Ok'
    }).then();
  }

  generetedPdf() {
    const DATA = document.getElementById('table');

    html2canvas(DATA).then(canvas => {
      let pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const imgWidth = pageWidth - 40;

      const imgHeight = canvas.height * imgWidth / canvas.width;

      const posX = 20;
      const posY = 30;

      pdf.setFontSize(18);
      pdf.text('Lista de Modelo (1A), (1B) y 2.', pageWidth / 2, 20, {align: 'center'});

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', posX, posY, imgWidth, imgHeight);
      pdf.save('documento.pdf');
    });
  }

  copyTableData() {
    const rows = this.table._internalRows();
    if (rows && rows.length) {
      const headers = Object.keys(rows[0]);

      const data = rows.map(row => headers.map(header => row[header]));

      const tableText = [headers, ...data].map(row => row.join('\t')).join('\n');
      this.copyTextToClipboard(tableText);
    }
  }

  copyTextToClipboard(text: string) {
    try {
      navigator.clipboard.writeText(text).then();
      this.toastr.success('Se ha copiado al portapapeles');
    } catch (err) {
      this.toastr.error('Error al copiar al portapapeles');
    }
  }

  updateFilter(event) {
    let val = event.target.value.toLowerCase().trim();

    const modelMap = {
      'modelo 2': '2',
      'modelo 1a': '7',
      'modelo 1b': '8'
    };

    val = modelMap[val] || val;

    this.rows = this.temp.filter(d => {
      if (d[this.searchField]) {
        const fieldValue = d[this.searchField].toString().toLowerCase();
        return val === '' || fieldValue === val || fieldValue === modelMap[fieldValue];
      }
      return false;
    });
    this.table.offset.set(0);
  }

  loadAllInvoicesForModelOneAndTwo() {
    this.invoiceService.getAllInvoicesForModelOneAndTwo().subscribe({
      next: (result: InvoiceModelOneTwo[]) => {
        this.temp = [...result];
        this.rows = result;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }
}
