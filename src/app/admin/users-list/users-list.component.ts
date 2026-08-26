import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {ClipboardService} from 'ngx-clipboard';
import {UserService} from "../../core/service/user-service/user.service";
import {User} from "../../core/models/user-model/user.model";
import {PrintService} from "../../core/service/print-service/print.service";
import {RolService} from "../../core/service/rol-service/rol.service";
import {Rol} from "../../core/models/rol-model/rol.model";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {UsersListCreateModalComponent} from "./users-list-create-modal/users-list-create-modal.component";
import {UsersListEditModalComponent} from "./users-list-edit-modal/users-list-edit-modal.component";
import {UsersListDetailModalComponent} from "./users-list-detail-modal/users-list-detail-modal.component";

const header = ['Usuario', 'Rol', 'Nombre', 'Apellido', 'Correo'];

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    UsersListCreateModalComponent,
    UsersListEditModalComponent,
    UsersListDetailModalComponent
  ]
})
export class UsersListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  user: User;
  items: any = [];

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService,
    private rolService: RolService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.onFillDropdownRol();
    this.loadUserList();
  }

  showError(message: string) {
    this.toastr.error(message, 'Error!');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row) {
    return row.height;
  }

  loadUserList() {
    this.userService.getAll().subscribe({
      next: (value: User[]) => {
        this.temp = [...value];
        this.rows = value;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.loadingIndicator = false;
          this.cdr.markForCheck();
        }, 500);
      },
      error: err => {
        this.showError('Error!' + err);
      },
    });
  }

  createOpenModal(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
  }

  onFillDropdownRol() {
    this.rolService.getAll().subscribe({
      next: (roles: Rol[]) => {
        for (const result of roles) {
          this.items.push(result);
        }
      },
      error: err => {
        this.showError('Error!' + err);
      },
    });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().includes(val) || !val;
    });
    this.table.offset.set(0);
  }

  deleteSingleRow(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then(result => {
      if (result.value) {
        this.deleteRecord(value);
      }
    });
  }

  deleteRecord(value) {
    this.userService.deleteUser(value).subscribe({
      next: () => {
        this.deleteRecordSuccess(1);
        this.loadUserList();
      },
      error: err => {
        this.showError('Error!' + err);
      },
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);

    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + ' rows successfully');
    }
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.user_name,
        items.rol_name,
        items.name,
        items.last_name,
        items.email,
      ];
    });

    this.printService.print(header, body, 'Lista de Usuarios', false);
  }
}
