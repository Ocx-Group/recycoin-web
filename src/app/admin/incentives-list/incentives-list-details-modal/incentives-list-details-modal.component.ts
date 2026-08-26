import { ChangeDetectorRef, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal, NgbNav, NgbNavContent, NgbNavItem, NgbNavLink, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';
import {Incentive} from "../../../core/models/incentive-model/incentive.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";


@Component({
  selector: 'app-incentives-list-details-modal',
  templateUrl: './incentives-list-details-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbNav,
    NgbNavItem,
    NgbNavContent,
    NgbNavLink,
    NgbNavOutlet
]
})
export class IncentivesListDetailsModalComponent implements OnInit {
  incentive: Incentive = new Incentive();
  calificationList!: [];
  productListData!: [];
  membershipData!: [];
  active = 1;

  @ViewChild('incentiveDetailsModal') incentiveDetailsModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private gradingService: GradingService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.fetchCalificationList();
    this.fetchMembership();
    this.fetchProductList();
  }

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
        this.cdr.markForCheck();
      }
    });
  }

  fetchProductList() {
    this.gradingService.getProductList().subscribe((resp) => {
      this.productListData = resp;
      this.cdr.markForCheck();
    });
  }

  fetchMembership() {
    this.gradingService.getMembership().subscribe((resp) => {
      this.membershipData = resp;
      this.cdr.markForCheck();
    });
  }
}
