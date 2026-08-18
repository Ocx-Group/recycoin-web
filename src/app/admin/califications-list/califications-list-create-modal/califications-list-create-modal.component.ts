import {Component, ViewChild, OnInit, Output, EventEmitter} from '@angular/core';
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
import {Grading} from "../../../core/models/grading-model/grading.model";
import {GradingService} from "../../../core/service/grading-service/grading.service";
import {NgClass, CommonModule} from "@angular/common";

@Component({
  selector: 'app-califications-list-create-modal',
  templateUrl: './califications-list-create-modal.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    NgbNav,
    NgbNavItem,
    NgbNavContent,
    NgbNavLink,
    NgbTooltip,
    NgbNavOutlet
  ]
})
export class CalificationsListCreateModalComponent implements OnInit {
  createCalificationForm!: FormGroup;
  submitted = false;
  active = 1;
  productListData!: [];
  membershipData!: [];
  calificationList!: [];
  grading: Grading = new Grading();

  @ViewChild('calificationCreateModal') calificationCreateModal: NgbModal;
  @Output('loadCalificationList') loadCalculationList: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private gradingService: GradingService,
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit(): void {
    this.calificationValidations();
    this.fetchProductList();
    this.fetchMembership();
    this.fetchCalificationList();
  }

  get create_calification_controls(): { [key: string]: AbstractControl } {
    return this.createCalificationForm.controls;
  }

  calificationValidations() {
    this.createCalificationForm = this.formBuilder.group({
      calification_name: ['', Validators.required],
      description: ['', Validators.required],
      status: [],
      personal_shopping: [0],
      personal_purchases_exact: [],
      network_shopping: [0],
      full_period: [],
      scope_level: [0],
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
    if (this.createCalificationForm.invalid) {
      return;
    }

    this.grading.name = this.createCalificationForm.value.calification_name;
    this.grading.description = this.createCalificationForm.value.description;
    this.grading.status = this.createCalificationForm.value.status ?? false;

    this.grading.personal_purchases = this.createCalificationForm.value.personal_shopping;
    this.grading.personal_purchases_exact = this.createCalificationForm.value.personal_purchases_exact ?? false;
    this.grading.purchases_network = this.createCalificationForm.value.network_shopping;
    this.grading.full_period = this.createCalificationForm.value.full_period ?? false;
    this.grading.scope_level = this.createCalificationForm.value.scope_level;
    this.grading.is_infinity = this.createCalificationForm.value.infinite ?? false;
    this.grading.binary_volume = this.createCalificationForm.value.binary_volume;
    this.grading.volume_points = this.createCalificationForm.value.calification_points;
    this.grading.volume_points_network = this.createCalificationForm.value.network_points_qualify;


    this.grading.children_left_leg = this.createCalificationForm.value.children_left_leg;
    this.grading.children_right_leg = this.createCalificationForm.value.children_right_leg;
    this.grading.front_by_matrix = this.createCalificationForm.value.front_by_matrix;
    this.grading.front_score_1 = this.createCalificationForm.value.qualified_fronts1;
    this.grading.front_score_2 = this.createCalificationForm.value.qualified_fronts2;
    this.grading.front_score_3 = this.createCalificationForm.value.qualified_fronts3;
    this.grading.front_qualif_1 = this.createCalificationForm.value.qualification_qualified_fronts1;
    this.grading.front_qualif_2 = this.createCalificationForm.value.qualification_qualified_fronts2;
    this.grading.front_qualif_3 = this.createCalificationForm.value.qualification_qualified_fronts3;
    this.grading.exact_front_ratings = this.createCalificationForm.value.exact_front_ratings ?? false;

    this.grading.products = this.createCalificationForm.value.products;
    this.grading.affiliations = this.createCalificationForm.value.affiliations;


    this.grading.leader_by_matrix = this.createCalificationForm.value.leader_by_matrix;
    this.grading.network_scope_level = this.createCalificationForm.value.network_scope_level;

    this.grading.network_leaders = this.createCalificationForm.value.network_leaders;
    this.grading.network_leaders_qualifier = this.createCalificationForm.value.network_leaders_qualifier;


    this.gradingService.createGrading(this.grading).subscribe(() => {
      this.showSuccess('The calification was created successfully!');
      this.closeModals();
      this.loadCalculationList.emit();
    })
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

}
