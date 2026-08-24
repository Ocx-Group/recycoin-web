import {Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Grading} from "../../../core/models/grading-model/grading.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";


@Component({
  selector: 'app-califications-list-details-modal',
  templateUrl: './califications-list-details-modal.component.html',
  standalone: true,
  imports: []
})
export class CalificationsListDetailsModalComponent implements OnInit {
  active = 1;
  gradingData: Grading = new Grading();
  calificationList!: [];
  productListData!: [];
  membershipData!: [];
  @ViewChild('calificationDetailsModal') calificationDetailsModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private gradingService: GradingService
  ) {
  }

  ngOnInit(): void {
    this.fetchCalificationList();
    this.fetchMembership();
    this.fetchProductList();
  }

  detailsOpenModal(content, grading: Grading) {
    this.gradingData = grading;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
  }

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
      }
    });
  }

  fetchProductList() {
    this.gradingService.getProductList().subscribe((resp) => {
      this.productListData = resp;
    });
  }

  fetchMembership() {
    this.gradingService.getMembership().subscribe((resp) => {
      this.membershipData = resp;
    });
  }
}
