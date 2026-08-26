import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {
  DataTableColumnCellDirective,
  DataTableColumnDirective,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';

import {Rol} from "../../../core/models/rol-model/rol.model";
import {MenuConfiguration} from "../../../core/models/menu-configuration-model/menu.configuration.model";
import {PrivilegeService} from "../../../core/service/privilege-service/privilege.service";
import {Privilege} from "../../../core/models/privilege-model/privilege.model";
import {TranslatePipe} from "@ngx-translate/core";
import {IconsModule} from "../../../shared";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-rol-list-permissions-modal',
  templateUrl: './rol-list-permissions-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    FormsModule
  ]
})
export class RolListPermissionsModalComponent implements OnInit {
  public idRole: number;
  title: string = '';
  rol = new Rol();
  rows = [];
  temp = [];

  SelectionType = SelectionType;
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  public selected: MenuConfiguration[] = [];

  @ViewChild('table') table: DatatableComponent;
  @ViewChild('permissionsCreateModal') permissionsCreateModal: NgbModal;

  constructor(
    private privilegeService: PrivilegeService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
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

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  loadPermissionsList(rolId: number) {
    this.privilegeService.getMenuConfigurations(rolId).subscribe({
      next: (menuConfiguration: MenuConfiguration[]) => {
        this.temp = [...menuConfiguration];
        this.rows = menuConfiguration;
        this.cdr.markForCheck();
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    if (this.temp && this.table) {
      this.rows = this.temp.filter((d) => {
        return d.name?.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.table.offset.set(0);
    }
  }

  updateOrcreatePrivilege(menu: MenuConfiguration) {
    let privilege = new Privilege();
    privilege.menu_configuration_id = menu.menu_configuration_id;
    privilege.rol_id = this.idRole;
    privilege.can_create = menu.can_create;
    privilege.can_edit = menu.can_edit;
    privilege.can_delete = menu.can_delete;
    privilege.can_read = menu.can_read;

    if (menu.privilege_id === null) {
      this.privilegeService.createPrivilege(privilege).subscribe({
        next: () => {
          this.loadPermissionsList(privilege.rol_id);
        },
        error: (err) => {
          this.showError('Error!' + err);
        },
      });
    } else {
      privilege.id = menu.privilege_id;

      this.privilegeService.updatePrivilege(privilege).subscribe({
        next: () => {
          this.loadPermissionsList(privilege.rol_id);
        },
        error: (err) => {
          this.showError('Error!' + err);
        },
      });
    }
  }
}

