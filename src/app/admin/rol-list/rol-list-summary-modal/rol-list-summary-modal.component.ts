import { ChangeDetectorRef, Component, ViewChild, HostListener, ChangeDetectionStrategy } from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ToastrService} from 'ngx-toastr';
import {Rol} from "../../../core/models/rol-model/rol.model";
import {UserService} from "../../../core/service/user-service/user.service";
import {User} from "../../../core/models/user-model/user.model";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-rol-list-summary-modal',
  templateUrl: './rol-list-summary-modal.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class RolListSummaryModalComponent {
  rolData = new Rol();
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table: DatatableComponent;
  @ViewChild('rolDetailModal') rolDetailModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  summaryOpenModal(content, rol: Rol) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl',
    });
    let user = new User();
    this.rolData.name = rol.name;
    this.rolData.description = rol.description;
    user.rol_id = rol.id;
    this.getUsersByRolId(user);
    // Al modal lo abre el padre desde su plantilla: ese click ensucia la
    // vista del PADRE, no la de este componente.
    this.cdr.markForCheck();
  }

  getUsersByRolId(user: User) {
    this.userService.getUsersByRolId(user).subscribe({
      next: (result: User[]) => {
        this.temp = [...result];
        this.rows = result;
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        }, 500);
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  getRowHeight(row) {
    return row.height;
  }
}
