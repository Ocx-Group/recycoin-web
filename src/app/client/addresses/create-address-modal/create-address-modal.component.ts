import { City } from './../../../core/models/cities-model/cities.model';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AffiliateAddress } from '@app/core/models/affiliate-address-model/affiliate-address.model'
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-create-address-modal',
    templateUrl: './create-address-modal.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule]
})
export class CreateAddressModalComponent implements OnInit {
  createAddressGroup: FormGroup;
  user: UserAffiliate;
  submitted = false;
  @ViewChild('createAddressModal', { static: true }) private modalContent: TemplateRef<any>;

  constructor(private modalService: NgbModal, private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.user = this.auth.currentUserAffiliateValue;
    this.initCreateAddressGroup();
  }

  get create_address_controls(): { [key: string]: AbstractControl } {
    return this.createAddressGroup.controls;
  }

  openCreateAddressModal() {
    this.modalService.open(this.modalContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  initCreateAddressGroup() {
    this.createAddressGroup = new FormGroup({
      fiscal_identification: new FormControl(),
      address_name: new FormControl(),
      name: new FormControl(),
      lastName: new FormControl(),
      company: new FormControl(),
      iva_number: new FormControl(),
      address: new FormControl(),
      address_line_2: new FormControl(),
      postal_code: new FormControl(),
      country: new FormControl(),
      state: new FormControl(),
      city: new FormControl(),
      landline_phone: new FormControl(),
      mobile_phone: new FormControl(),
      other: new FormControl()
    })
  }

  saveNewAddress() {
    this.submitted = true;

    if (this.createAddressGroup.invalid)
      return;


  }

  setNewAddress(): AffiliateAddress {
    const affiliateAddress = new AffiliateAddress();

    affiliateAddress.affiliateId = this.user.id;
    affiliateAddress.fiscalIdentification = this.createAddressGroup.value.fiscal_identification;
    affiliateAddress.addressName = this.createAddressGroup.value.address_name;
    affiliateAddress.name = this.createAddressGroup.value.name;
    affiliateAddress.lastName = this.createAddressGroup.value.lastName;
    affiliateAddress.company = this.createAddressGroup.value.company;
    affiliateAddress.ivaNumber = this.createAddressGroup.value.iva_number;
    affiliateAddress.address = this.createAddressGroup.value.address;
    affiliateAddress.addressLine2 = this.createAddressGroup.value.address_line_2;
    affiliateAddress.postalCode = this.createAddressGroup.value.postal_code;
    affiliateAddress.city = this.createAddressGroup.value.city;
    affiliateAddress.state = this.createAddressGroup.value.state;
    affiliateAddress.country = this.user.country;
    affiliateAddress.landlinePhone = this.createAddressGroup.value.landline_phone;
    affiliateAddress.mobilePhone = this.createAddressGroup.value.mobile_phone;
    affiliateAddress.other = this.createAddressGroup.value.other;
    affiliateAddress.date = new Date();
    affiliateAddress.email = this.user.email;

    return affiliateAddress;
  }

}
