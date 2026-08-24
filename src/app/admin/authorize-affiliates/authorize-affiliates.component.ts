import {Component, ViewChild, HostListener, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastrService} from 'ngx-toastr';
import {ClipboardService} from 'ngx-clipboard';
import {
  NgbAlert,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {PrintService} from "../../core/service/print-service/print.service";
import {AffiliateService} from "../../core/service/affiliate-service/affiliate.service";
import {UserAffiliate} from "../../core/models/user-affiliate-model/user.affiliate.model";
import {
  AuthorizeAffiliatesEditModalComponent
} from "./authorize-affiliates-edit-modal/authorize-affiliates-edit-modal.component";



interface Alert {
  type: string;
  message: string;
}

const ALERTS: Alert[] = [
  {
    type: 'info',
    message: '',
  },
];

const header = [
  'Id',
  'User',
  'Email',
  'Identity',
  'Register Day',
  'Father',
  'Sponsor',
  'Binary Sponsor',
];

@Component({
  selector: 'app-authorize-affiliates',
  templateUrl: './authorize-affiliates.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    NgbAlert,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    AuthorizeAffiliatesEditModalComponent
]
})
export class AuthorizeAffiliatesComponent implements OnInit {
  alerts: Alert[];
  show: Boolean = true;
  linkMsj: String = 'hide';
  rows = [];
  temp = [];
  approvedArray = [];
  disapprovedArray = [];
  loadingIndicator = true;
  approvedSelectAll = false;
  disApprovedSelectAll = false;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService,
    private affiliateService: AffiliateService,
    private modalService: NgbModal,
  ) {
    this.alerts = Array.from(ALERTS);
  }

  ngOnInit() {
    this.loadAffiliateList();
  }

  loadAffiliateList() {
    this.affiliateService.getAllAffiliatesAuthorization().subscribe((affiliates: UserAffiliate[]) => {
      if (affiliates !== null) {
        this.temp = [...affiliates];
        this.rows = affiliates;
      }
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  openModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  setApprovedArray(id: number) {
    let index = this.disapprovedArray.indexOf(id);
    if (index > -1) {
      this.disapprovedArray.splice(index, 1);
    }
    this.approvedArray.push(id);
  }

  setdisapprovedArray(id: number) {
    let index = this.approvedArray.indexOf(id);
    if (index > -1) {
      this.approvedArray.splice(index, 1);
    }
    this.disapprovedArray.push(id);
  }

  selectionProcess() {
    if (this.approvedArray.length === 0 && this.disapprovedArray.length === 0) {
      this.showError('You must select at least one user to be processed!');
    }

    this.affiliateService
      .authorizationAffiliates(this.approvedArray, this.disapprovedArray)
      .subscribe((response) => {
        if (response.success) {
          this.showSuccess('The affiliations have been processed successfully!');
          this.loadAffiliateList();
        } else {
          this.showError('Error!');
        }
      });
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  fillApprovedArray() {
    this.disapprovedArray = [];
    this.rows.forEach((item: UserAffiliate) => {
      this.approvedArray.push(item.id);
    });
    this.approvedSelectAll = true;
    this.disApprovedSelectAll = false;
  }

  fillDisapprovedArray() {
    this.approvedArray = [];
    this.rows.forEach((item: UserAffiliate) => {
      this.disapprovedArray.push(item.id);
    });
    this.approvedSelectAll = false;
    this.disApprovedSelectAll = true;
  }

  getRowHeight(row) {
    return row.height;
  }

  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/admin/authorize-affiliates-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    this.rows = temp;
    this.table.offset.set(0);
  }

  close(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  showMsj() {
    if (this.show) {
      this.show = false;
      this.linkMsj = 'show';
    } else {
      this.show = true;
      this.linkMsj = 'hide';
    }
  }

  clipBoardCopy() {
    const extractData = this.temp.map((items: any) => {
      const data = [
        items.id,
        items.user,
        items.email,
        items.identity,
        items.dateRegister,
        items.father,
        items.sponsor,
        items.binarySponsor,
      ];
      return data;
    });
    var string = JSON.stringify(extractData);
    var result = this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }


  onPrint() {
    const body = this.temp.map((items: any) => {
      const data = [
        items.id,
        items.user,
        items.email,
        items.identity,
        items.dateRegister,
        items.father,
        items.sponsor,
        items.binarySponsor,
      ];
      return data;
    });

    this.printService.print(
      header,
      body,
      'Lista de Afiliados Autorizados',
      false
    );
  }
}
