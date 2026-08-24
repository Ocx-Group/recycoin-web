import { AffiliateAddressService } from '@app/core/service/affiliate-address-service/affiliate-address.service';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';

import { TranslateModule } from '@ngx-translate/core';
import {CreateAddressModalComponent} from "@app/client/addresses/create-address-modal/create-address-modal.component";
import { IconsModule } from '@app/shared';

@Component({
    selector: 'app-addresses',
    templateUrl: './addresses.component.html',
    standalone: true,
  imports: [NgxDatatableModule, TranslateModule, CreateAddressModalComponent, IconsModule]
})
export class AddressesComponent implements OnInit {
  user: UserAffiliate = new UserAffiliate();
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(private affiliateAddressService: AffiliateAddressService, private auth: AuthService) {

  }

  ngOnInit(): void {
    this.user = this.auth.currentUserAffiliateValue;
    this.loadAddressesByAffiliate();
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
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset = 0;
  }

  loadAddressesByAffiliate() {
    this.affiliateAddressService.getAffiliateAddressByAffiliateId(this.user.id).subscribe({
      next: (value) => {
        if (value.data) {
          this.rows = [...value.data]
          this.temp = value.data;
          this.loadingIndicator = false;
        }
      },
      error: (err) => {

      },
    })
  }


}
