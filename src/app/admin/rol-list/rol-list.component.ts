import {Component, HostListener, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import Swal from 'sweetalert2';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardService} from 'ngx-clipboard';
import {Rol} from "../../core/models/rol-model/rol.model";
import {RolService} from "../../core/service/rol-service/rol.service";
import {PrintService} from "../../core/service/print-service/print.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../shared";
import {RolListCreateModalComponent} from "./rol-list-create-modal/rol-list-create-modal.component";
import {RolListEditModalComponent} from "./rol-list-edit-modal/rol-list-edit-modal.component";
import {RolListPermissionsModalComponent} from "./rol-list-permissions-modal/rol-list-permissions-modal.component";
import {RolListSummaryModalComponent} from "./rol-list-summary-modal/rol-list-summary-modal.component";

const header = ['Id', 'Rol', 'Descripción', 'Usuarios Asociados', 'Permisos'];

@Component({
  selector: 'app-rol-list',
  templateUrl: './rol-list.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    RolListCreateModalComponent,
    RolListEditModalComponent,
    RolListPermissionsModalComponent,
    RolListSummaryModalComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem
  ]
})
export class RolListComponent implements OnInit {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  selected = [];
  columns: any[] = [{prop: 'name'}, {name: 'Company'}, {name: 'Gender'}];
  createRolForm: FormGroup;
  submitted = false;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private modalService: NgbModal,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private clipboardService: ClipboardService,
    private printService: PrintService
  ) {
  }

  ngOnInit() {
    this.loadRolList();
    this.loadValidations();
  }

  loadValidations() {
    this.createRolForm = this.formBuilder.group({
      rol_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    if (this.table) {
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  getRowHeight(row) {
    return row.height;
  }

  loadRolList() {
    this.rolService.getAll().subscribe({
      next: (roles: Rol[]) => {
        this.temp = [...roles];
        this.rows = roles;
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 500);
      },
      error: (err) => {
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

  deleteSingleRow(value) {
    Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.deleteRecord(value);
      }
    });
  }

  deleteRecord(value) {
    this.rolService.deleteRol(value).subscribe({
      next: (value) => {
        this.deleteRecordSuccess(1);
        this.loadRolList();
      },
      error: (err) => {
        this.showError('Error!' + err);
      },
    });
  }

  deleteRecordSuccess(count) {
    this.toastr.success(count + ' Records Deleted Successfully', '');
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    this.rows = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.table.offset.set(0);
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp.length === 0) {
      this.toastr.info('no data to copy');
    } else {
      this.toastr.success('copied ' + this.temp.length + ' rows successfully');
    }
  }

  onPrint() {
    const body = this.temp.map((items: any) => {
      return [
        items.id,
        items.name,
        items.description,
        items.associated_users,
        items.permissions,
      ];
    });
    this.printService.print(header, body, 'Lista de Roles', false);
  }
}
