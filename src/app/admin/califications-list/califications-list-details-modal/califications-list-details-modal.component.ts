import { ChangeDetectorRef, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Grading} from "../../../core/models/grading-model/grading.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";


@Component({
  selector: 'app-califications-list-details-modal',
  templateUrl: './califications-list-details-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class CalificationsListDetailsModalComponent implements OnInit {
  active = 1;
  gradingData: Grading = new Grading();
  calificationList: any[] = [];
  productListData: any[] = [];
  membershipData: any[] = [];
  @ViewChild('calificationDetailsModal') calificationDetailsModal: NgbModal;

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

  detailsOpenModal(content, grading: Grading) {
    this.gradingData = grading;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
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
