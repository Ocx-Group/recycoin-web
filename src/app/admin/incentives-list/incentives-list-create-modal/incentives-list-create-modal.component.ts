import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup, ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbModal,
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
  NgbTooltip
} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {Incentive} from "../../../core/models/incentive-model/incentive.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {IncentiveService} from "../../../core/service/incentive-service/incentive.service";
import {NgClass, CommonModule} from "@angular/common";


@Component({
  selector: 'app-incentives-list-create-modal',
  templateUrl: './incentives-list-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgbTooltip,
    NgbNav,
    NgbNavItem,
    NgbNavContent,
    NgbNavLink,
    NgbNavOutlet
  ]
})
export class IncentivesListCreateModalComponent implements OnInit {
  createIncentivesForm!: FormGroup;
  productListData!: [];
  membershipData!: [];
  calificationList!: [];
  submitted = false;
  active = 1;
  incentive: Incentive = new Incentive();

  @ViewChild('incentivesCreateModal') incentivesCreateModal: NgbModal;
  @Output('loadIncentiveList') loadIncentiveList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private gradingService: GradingService,
    private incentiveService: IncentiveService,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.incentiveValidations();
    this.fetchCalificationList();
    this.fetchMembership();
    this.fetchProductList();
  }

  get create_incentive_controls(): { [key: string]: AbstractControl } {
    return this.createIncentivesForm.controls;
  }

  incentiveValidations() {
    this.createIncentivesForm = this.formBuilder.group({
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

  fetchCalificationList() {
    this.gradingService.getAll().subscribe((resp) => {
      if (resp !== null) {
        this.calificationList = resp;
      }
    });
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  showSuccess(message: string) {
    this.toastr.success(message, 'Success!');
  }

  onAddRowSave() {
    this.submitted = true;

    if (this.createIncentivesForm.invalid) {
      return;
    }

    this.incentive.name = this.createIncentivesForm.value?.incentive_name;
    this.incentive.description = this.createIncentivesForm.value.description;
    this.incentive.grading = this.createIncentivesForm.value.calification;
    this.incentive.status = this.createIncentivesForm.value.status ?? false;

    this.incentive.personal_purchases =
      this.createIncentivesForm.value.personal_shopping;
    this.incentive.personal_purchases_exact =
      this.createIncentivesForm.value.personal_purchases_exact ?? false;
    this.incentive.purchases_network =
      this.createIncentivesForm.value.network_shopping;
    this.incentive.is_infinity =
      this.createIncentivesForm.value.infinite ?? false;
    this.incentive.binary_volume =
      this.createIncentivesForm.value.binary_volume;
    this.incentive.volume_points =
      this.createIncentivesForm.value.calification_points;
    this.incentive.volume_points_network =
      this.createIncentivesForm.value.network_points_qualify;

    this.incentive.children_left_leg =
      this.createIncentivesForm.value.children_left_leg;
    this.incentive.children_right_leg =
      this.createIncentivesForm.value.children_right_leg;
    this.incentive.front_by_matrix =
      this.createIncentivesForm.value.front_by_matrix;
    this.incentive.front_score_1 =
      this.createIncentivesForm.value.qualified_fronts1;
    this.incentive.front_score_2 =
      this.createIncentivesForm.value.qualified_fronts2;
    this.incentive.front_score_3 =
      this.createIncentivesForm.value.qualified_fronts3;
    this.incentive.front_qualif_1 =
      this.createIncentivesForm.value.qualification_qualified_fronts1;
    this.incentive.front_qualif_2 =
      this.createIncentivesForm.value.qualification_qualified_fronts2;
    this.incentive.front_qualif_3 =
      this.createIncentivesForm.value.qualification_qualified_fronts3;
    this.incentive.exact_front_ratings =
      this.createIncentivesForm.value.exact_front_ratings ?? false;

    this.incentive.products = this.createIncentivesForm.value.products;
    this.incentive.affiliations = this.createIncentivesForm.value.affiliations;

    this.incentive.leader_by_matrix =
      this.createIncentivesForm.value.leader_by_matrix;
    this.incentive.scope_level =
      this.createIncentivesForm.value.network_scope_level;

    this.incentive.network_leaders =
      this.createIncentivesForm.value.network_leaders;
    this.incentive.network_leaders_qualifier =
      this.createIncentivesForm.value.network_leaders_qualifier;

    this.incentiveService.createGrading(this.incentive).subscribe(() => {
      this.showSuccess('The incentive was created successfully!');
      this.closeModals();
      this.loadIncentiveList.emit();
    });

  }
}
