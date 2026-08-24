import { Component, OnInit, ViewChild } from '@angular/core';
import { Invoice } from '../../../core/models/invoice-model/invoice.model';
import { UserAffiliate } from '../../../core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '../../../core/service/affiliate-service/affiliate.service';
import { AuthService } from '../../../core/service/authentication-service/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-billing-purchases-detail-modal',
  templateUrl: './billing-purchases-detail-modal.component.html',
  standalone: true,
  imports: [],
})
export class BillingPurchasesDetailModalComponent implements OnInit {
  protected invoice: Invoice = new Invoice();
  protected user: UserAffiliate = new UserAffiliate();
  countries = [];
  subTotal: number;
  totalDiscount: number;
  totalTax: number;
  Math = Math;

  @ViewChild('billingPurchasesDetailModal')
  billingPurchasesDetailModal: NgbModal;

  constructor(
    private readonly modalService: NgbModal,
    private readonly auth: AuthService,
    private readonly affiliateService: AffiliateService,
    private readonly toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.getAllCountries();
    this.getCurrentUser();
  }

  getAllCountries() {
    this.affiliateService.getCountries().subscribe({
      next: resp => {
        this.countries = resp;
      },
      error: err => {
        this.toastr.error('Se produjo un error al cargar los países');
        console.error(err);
      },
    });
  }

  getCountryName(id: number) {
    const country = this.countries.find(item => item.id === id);
    return country ? country.name : '';
  }

  getCurrentUser() {
    // Usar signal para obtener el usuario afiliado
    this.user = this.auth.userAffiliate();
  }

  billingPurchasesOpenModal(content: any, invoice: Invoice) {
    this.totalDiscount = invoice.invoicesDetails[0].productDiscount;
    this.totalTax = invoice.invoicesDetails[0].productIva;
    this.subTotal = invoice.invoicesDetails.reduce((accumulator, item) => {
      return accumulator + item.productPrice * item.productQuantity;
    }, 0);

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
      centered: true,
    });
    this.invoice = invoice;
  }
}
