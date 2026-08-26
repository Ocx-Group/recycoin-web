import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';

import {UserAffiliate} from '@app/core/models/user-affiliate-model/user.affiliate.model';
import {MatrixQualificationService} from '@app/core/service/matrix-qualification-service/matrix-qualification.service';
import {MatrixRequest} from '@app/core/interfaces/matrix-request';
import {MatrixConfigurationService} from "@app/core/service/matrix-configuration/matrix-configuration.service";
import { CurrencyPipe, CommonModule } from "@angular/common";

@Component({
  selector: 'app-matrix-activation-modal',
  templateUrl: './matrix-activation-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe
  ]
})
export class MatrixActivationModalComponent implements OnInit {
  @Output() matrixActivated = new EventEmitter<boolean>();
  @ViewChild('matrixActivationModal') matrixActivationModal: any;

  selectedUser: UserAffiliate | null = null;
  matrixConfigurations: any[] = [];
  selectedMatrixId: number | null = null;
  isLoading: boolean = false;
  modalRef: NgbModalRef | null = null;

  constructor(
    private modalService: NgbModal,
    private toast: ToastrService,
    private matrixQualificationService: MatrixQualificationService,
    private matrixConfigurationService: MatrixConfigurationService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.loadMatrixConfigurations();
  }

  loadMatrixConfigurations(): void {
    this.isLoading = true;
    this.matrixConfigurationService.getAllMatrixConfigurations().subscribe({
      next: (data) => {
        console.log(data);
        this.matrixConfigurations = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading matrix configurations:', error);
        this.toast.error('Error al cargar las configuraciones de matriz');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openModal(user: UserAffiliate): void {
    this.selectedUser = user;
    this.selectedMatrixId = null; // Reset selection
    this.modalRef = this.modalService.open(this.matrixActivationModal, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true
    });
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  activateMatrix(): void {
    if (!this.selectedUser || !this.selectedMatrixId) {
      this.toast.warning('Por favor seleccione una matriz para activar');
      return;
    }

    this.isLoading = true;
    const request: MatrixRequest = {
      userId: this.selectedUser.id,
      matrixType: this.selectedMatrixId
    };

    console.log("enviando request", request);

    this.matrixQualificationService.processQualificationAdmin(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.toast.success('Matriz activada correctamente');
          this.matrixActivated.emit(true);
          this.closeModal();
        } else {
          this.toast.error('Error al activar la matriz');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.markForCheck();
        console.error('Error activating matrix:', error);
        this.toast.error('Error al activar la matriz');
      }
    });
  }

  onMatrixSelect(matrixId: number): void {
    this.selectedMatrixId = matrixId;
  }
}
