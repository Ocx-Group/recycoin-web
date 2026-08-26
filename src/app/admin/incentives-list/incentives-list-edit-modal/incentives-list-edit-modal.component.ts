import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {IncentiveService} from "../../../core/service/incentive-service/incentive.service";
import {Incentive} from "../../../core/models/incentive-model/incentive.model";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-incentives-list-edit-modal',
  templateUrl: './incentives-list-edit-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class IncentivesListEditModalComponent implements OnInit {
  editIncentivesForm!: FormGroup;
  incentive: Incentive = new Incentive();
  productListData!: [];
  membershipData!: [];
  calificationList!: [];
  submitted = false;
  active = 1;

  @ViewChild('incentivesEditModal') incentivesEditModal: NgbModal;
  @Output('loadIncentiveList') loadIncentiveList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private gradingService: GradingService,
    private incentiveService: IncentiveService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.fetchCalificationList();
    this.fetchMembership();
    this.fetchProductList();
    this.incentiveValidations();
  }

  get edit_incentive_controls(): { [key: string]: AbstractControl } {
    return this.editIncentivesForm.controls;
  }

  editOpenModal(content, incentive: Incentive) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });

    this.incentive.id = incentive.id;
    this.editIncentivesForm.setValue({
      incentive_name: incentive.name,
      description: incentive.description,
      calification: incentive.grading,
      status: incentive.status,
      personal_shopping: incentive.personal_purchases,
      personal_purchases_exact: incentive.personal_purchases_exact,
      network_shopping: incentive.purchases_network,
      infinite: incentive.is_infinity,
      binary_volume: incentive.binary_volume,
      calification_points: incentive.volume_points,
      network_points_qualify: incentive.volume_points_network,
      children_left_leg: incentive.children_left_leg,
      children_right_leg: incentive.children_right_leg,
      front_by_matrix: incentive.front_by_matrix.toString(),
      exact_front_ratings: incentive.exact_front_ratings,
      qualified_fronts1: incentive.front_score_1,
      qualified_fronts2: incentive.front_score_2,
      qualified_fronts3: incentive.front_score_3,
      qualification_qualified_fronts1: incentive.front_qualif_1,
      qualification_qualified_fronts2: incentive.front_qualif_2,
      qualification_qualified_fronts3: incentive.front_qualif_3,
      products: incentive.products,
      affiliations: incentive.affiliations,
      network_scope_level: incentive.scope_level,
      network_leaders: incentive.network_leaders,
      network_leaders_qualifier: incentive.network_leaders_qualifier,
      leader_by_matrix: incentive.leader_by_matrix.toString(),
    });
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
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

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
        this.cdr.markForCheck();
      }
    });
  }

  incentiveValidations() {
    this.editIncentivesForm = this.formBuilder.group({
      incentive_name: ['', Validators.required],
      description: ['', Validators.required],
      calification: ['', Validators.required],
      status: [''],
      personal_shopping: [0],
      personal_purchases_exact: [],
      network_shopping: [0],
      infinite: [],
      binary_volume: [0],
      calification_points: [0],
      network_points_qualify: [0],
      children_left_leg: [0],
      children_right_leg: [0],
      front_by_matrix: [0],
      exact_front_ratings: [],
      qualified_fronts1: [0],
      qualified_fronts2: [0],
      qualified_fronts3: [0],
      qualification_qualified_fronts1: [0],
      qualification_qualified_fronts2: [0],
      qualification_qualified_fronts3: [0],
      products: [0],
      affiliations: [0],
      network_scope_level: [0],
      network_leaders: [0],
      network_leaders_qualifier: [0],
      leader_by_matrix: [0],
    });
  }

  onAddRowSave() {
    this.submitted = true;

    if (this.editIncentivesForm.invalid) {
      return;
    }

    this.incentive.name = this.editIncentivesForm.value?.incentive_name;
    this.incentive.description = this.editIncentivesForm.value.description;
    this.incentive.grading = this.editIncentivesForm.value.calification;
    this.incentive.status = this.editIncentivesForm.value.status ?? false;

    this.incentive.personal_purchases = parseInt(
      this.editIncentivesForm.value.personal_shopping
    );
    this.incentive.personal_purchases_exact =
      this.editIncentivesForm.value.personal_purchases_exact ?? false;
    this.incentive.purchases_network =
      this.editIncentivesForm.value.network_shopping;
    this.incentive.is_infinity =
      this.editIncentivesForm.value.infinite ?? false;
    this.incentive.binary_volume = this.editIncentivesForm.value.binary_volume;
    this.incentive.volume_points =
      this.editIncentivesForm.value.calification_points;
    this.incentive.volume_points_network =
      this.editIncentivesForm.value.network_points_qualify;

    this.incentive.children_left_leg =
      this.editIncentivesForm.value.children_left_leg;
    this.incentive.children_right_leg =
      this.editIncentivesForm.value.children_right_leg;
    this.incentive.front_by_matrix = parseInt(
      this.editIncentivesForm.value.front_by_matrix
    );
    this.incentive.front_score_1 =
      this.editIncentivesForm.value.qualified_fronts1;
    this.incentive.front_score_2 =
      this.editIncentivesForm.value.qualified_fronts2;
    this.incentive.front_score_3 =
      this.editIncentivesForm.value.qualified_fronts3;
    this.incentive.front_qualif_1 =
      this.editIncentivesForm.value.qualification_qualified_fronts1;
    this.incentive.front_qualif_2 =
      this.editIncentivesForm.value.qualification_qualified_fronts2;
    this.incentive.front_qualif_3 =
      this.editIncentivesForm.value.qualification_qualified_fronts3;
    this.incentive.exact_front_ratings =
      this.editIncentivesForm.value.exact_front_ratings ?? false;

    this.incentive.products = this.editIncentivesForm.value.products;
    this.incentive.affiliations = this.editIncentivesForm.value.affiliations;

    this.incentive.leader_by_matrix = parseInt(
      this.editIncentivesForm.value.leader_by_matrix
    );
    this.incentive.scope_level =
      this.editIncentivesForm.value.network_scope_level;

    this.incentive.network_leaders =
      this.editIncentivesForm.value.network_leaders;
    this.incentive.network_leaders_qualifier =
      this.editIncentivesForm.value.network_leaders_qualifier;

    this.incentiveService.updateIncentive(this.incentive).subscribe(() => {
      this.showSuccess('The incentive was update successfully!');
      this.closeModals();
      this.loadIncentiveList.emit();
    });
  }
}
