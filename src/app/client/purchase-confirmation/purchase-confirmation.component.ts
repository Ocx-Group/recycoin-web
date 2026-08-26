import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '@app/core/service/invoice-service/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { delay, retryWhen, take } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-purchase-confirm',
    templateUrl: './purchase-confirmation.component.html',
    styleUrls: ['./purchase-confirmation.component.sass'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class PurchaseConfirmationComponent {
  private invoiceDownloaded = false;
  brandId: number;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private invoiceService: InvoiceService, private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      const token = params['parametro1'];
      const reference = params['parametro2'];

      if (token && reference) {
        this.showConfirmationAlert(token, reference);
      }
    });
  }

  private showConfirmationAlert(token: string, reference: string): void {
    let counter = 120;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    });

    const swalTimerInterval = setInterval(() => {
      if (counter === 110) {
        this.onDownloadInvoice(reference);
      }
      if (counter === 0 || this.invoiceDownloaded) {
        clearInterval(swalTimerInterval);
        Swal.close();
        this.router.navigate(['/app/home']);
      }
      counter--;
    }, 1000);

    swalWithBootstrapButtons.fire({
      title: 'Confirmación de Compra',
      html: `Su compra está siendo procesada, por favor espere mientras se realiza el proceso.<br></strong>`,
      icon: 'success',
      timer: 120000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        this.router.navigate(['/app/home']);
      }
    });
  }

  onDownloadInvoice(reference: string) {
    this.invoiceService.createInvoiceByReference(reference).pipe(
      retryWhen(errors => errors.pipe(
        delay(30000),
        take(3)
      ))
    ).subscribe({
      next: (result: { blob: Blob, brandId: number | null }) => {
        this.brandId = result.brandId;

        const blobUrl = window.URL.createObjectURL(result.blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `invoice_${reference}.pdf`;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);

        this.invoiceDownloaded = true;
      },
      error: (err) => {
        console.log(err);
        this.showError('Error downloading the invoice. Please try again.');
      },
    });
  }

  showError(message: string) {
    this.toastrService.error(message, 'Error');
  }
}
