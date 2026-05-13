import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MyTreeNodeClient } from '@app/core/models/unilevel-tree-model/tree-node';
import { NgxSpinnerService } from 'ngx-spinner';

import { MatrixRequest } from '@app/core/interfaces/matrix-request';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { MatrixConfigurationService } from '@app/core/service/matrix-configuration/matrix-configuration.service';
import { MatrixService } from '@app/core/service/matrix-service/matrix.service';
import { MatrixQualificationService } from '@app/core/service/matrix-qualification-service/matrix-qualification.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientUnilevelTreeComponentComponent } from '@app/client/unilevel-tree/unilevel-tree-component/client-unilevel-tree-component.component';

@Component({
  selector: 'app-view-unilevel-tree',
  templateUrl: './view-unilevel-tree.component.html',
  styleUrls: ['./view-unilevel-tree.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    ClientUnilevelTreeComponentComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewUnilevelTreeComponent implements OnInit {
  userId: number;
  user: UserAffiliate;
  btnBack: boolean = false;
  active;
  matrixConfigurations: any[] = [];
  isReachedWithdrawalLimit: boolean = false;
  tree: MyTreeNodeClient = {
    id: 0,
    userName: '',
    image: '',
    children: [],
  };
  typeSelected: string = 'cube-transition';
  showDiv = false;

  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private panScrollLeft = 0;
  private panScrollTop = 0;

  startPan(event: MouseEvent, container: HTMLElement) {
    this.isPanning = true;
    this.panStartX = event.clientX;
    this.panStartY = event.clientY;
    this.panScrollLeft = container.scrollLeft;
    this.panScrollTop = container.scrollTop;
    container.classList.add('is-panning');
  }

  onPan(event: MouseEvent, container: HTMLElement) {
    if (!this.isPanning) return;
    event.preventDefault();
    container.scrollLeft =
      this.panScrollLeft - (event.clientX - this.panStartX);
    container.scrollTop = this.panScrollTop - (event.clientY - this.panStartY);
  }

  endPan(container: HTMLElement) {
    if (!this.isPanning) return;
    this.isPanning = false;
    container.classList.remove('is-panning');
  }

  constructor(
    private readonly authService: AuthService,
    private readonly spinnerService: NgxSpinnerService,
    private readonly affiliateService: AffiliateService,
    private readonly matrixConfigurationService: MatrixConfigurationService,
    private readonly matrixService: MatrixService,
    private readonly matrixQualificationService: MatrixQualificationService,
    private readonly toastrService: ToastrService,
  ) {}

  ngOnInit() {
    this.active = 1;
    this.user = this.authService.currentUserAffiliateValue;
    this.userId = this.user.id;
    if (this.userId) {
      this.onloadFamilyTree(this.userId);
      this.hasReachedWithdrawalLimit(this.userId);
      this.btnBack = false;
    }
    this.getAllMatrixConfigurations();
  }

  successMessage(message: string) {
    this.toastrService.success(message, 'Éxito', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  errorMessage(message: string) {
    this.toastrService.error(message, 'Error', {
      timeOut: 3000,
      progressBar: true,
      progressAnimation: 'increasing',
      closeButton: true,
    });
  }

  getAllMatrixConfigurations() {
    this.matrixConfigurationService.getAllMatrixConfigurations().subscribe({
      next: config => {
        console.log('config:', config);
        this.matrixConfigurations = config;
      },
      error: err => {
        console.error('Error', err);
      },
    });
  }

  protected onloadFamilyTree(id: number) {
    this.showDiv = false;
    this.spinnerService.show();
    this.btnBack = true;

    if (this.active === 1) {
      this.loadUnilevelTree(id);
    } else if (this.active >= 3) {
      const matrixIndex = this.active - 3;

      if (matrixIndex >= 0 && matrixIndex < this.matrixConfigurations.length) {
        const matrixConfig = this.matrixConfigurations[matrixIndex];

        const matrixTypeValue = matrixConfig.matrixType;

        if (!matrixTypeValue) {
          console.error(
            'No se pudo determinar el matrixType a partir de la configuración:',
            matrixConfig,
          );
          this.spinnerService.hide();
          return;
        }

        this.loadMatrixTree(id, matrixTypeValue);
      } else {
        this.spinnerService.hide();
      }
    } else {
      this.spinnerService.hide();
    }
  }

  private loadUnilevelTree(id: number) {
    this.affiliateService.getUniLevelTree(id).subscribe({
      next: (users: MyTreeNodeClient) => {
        if (users !== null) {
          this.tree = this.initializeTreeNode(users);
          setTimeout(() => {
            this.spinnerService.hide();
            this.showDiv = true;
          }, 500);
        }
      },
      error: error => {
        console.error('Error loading unilevel tree:', error);
        this.spinnerService.hide();
      },
    });
  }

  private initializeTreeNode(node: MyTreeNodeClient): MyTreeNodeClient {
    if (!node) return node;

    // Inicializar hideChildren si no existe
    node.hideChildren ??= false;

    // Asegurar que children existe y es un array
    if (!node.children) {
      node.children = [];
    }

    // Recursivamente inicializar los nodos hijos
    if (node.children && node.children.length > 0) {
      node.children = node.children.map(child =>
        this.initializeTreeNode(child),
      );
    }

    return node;
  }

  onTabChange(newActiveId: number) {
    this.active = newActiveId;
    this.onloadFamilyTree(this.userId);
    this.btnBack = false;
  }

  loadMatrixTree(id: number, matrixType: number) {
    const request: MatrixRequest = {
      userId: id,
      matrixType: matrixType,
    };

    this.showDiv = false;
    this.spinnerService.show();
    this.matrixService.getMatrixByUserId(request).subscribe({
      next: (users: MyTreeNodeClient) => {
        console.log('Matriz recibida:', users);
        if (users !== null) {
          this.tree = this.initializeTreeNode(users);
          console.log('Árbol inicializado:', this.tree);
          setTimeout(() => {
            this.spinnerService.hide();
            this.showDiv = true;
          }, 500);
        }
      },
      error: error => {
        console.error('Error loading matrix tree:', error);
        this.spinnerService.hide();
      },
    });
  }

  activatedMatrixWithBalance(matrixType: number) {
    const user = this.authService.currentUserAffiliateValue;
    const request: MatrixRequest = {
      userId: user.id,
      matrixType: matrixType,
    };

    Swal.fire({
      title: 'Activar matriz',
      text: '¿Está seguro de activar la matriz con saldo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then(result => {
      if (result.isConfirmed) {
        this.spinnerService.show();
        this.matrixQualificationService
          .processDirectPaymentMatrixActivation(request)
          .subscribe({
            next: response => {
              console.log('Respuesta de activación:', response);
              if (response) {
                this.active = matrixType + 2;
                this.onloadFamilyTree(this.userId);
                this.successMessage('Matriz activada con éxito.');
              } else {
                this.errorMessage('Error al activar la matriz.');
              }
            },
            error: error => {
              console.error('Error en la activación:', error);
            },
          });
      }
    });
  }

  hasReachedWithdrawalLimit(userId: number) {
    this.matrixQualificationService
      .hasReachedWithdrawalLimit(userId)
      .subscribe({
        next: value => {
          if (value.success) {
            this.isReachedWithdrawalLimit = value.data;
          } else {
            this.isReachedWithdrawalLimit = false;
          }
        },
        error: err => {
          console.error(err);
        },
      });
  }
}
