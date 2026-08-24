import {Component, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ClipboardService} from 'ngx-clipboard';
import {ToastrService} from 'ngx-toastr';
import {User} from '../../../core/models/user-model/user.model';
import {TranslatePipe} from "@ngx-translate/core";
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from "@swimlane/ngx-datatable";

@Component({
  selector: 'app-users-list-detail-modal',
  templateUrl: './users-list-detail-modal.component.html',
  providers: [ToastrService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective
  ]
})
export class UsersListDetailModalComponent {
  rows = [];
  temp = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;
  user: User = new User();
  @ViewChild('userDetailModal') userDetailModal: NgbModal;

  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
    private clipboardService: ClipboardService
  ) {
  }

  clipBoardCopy() {
    const string = JSON.stringify(this.temp);
    this.clipboardService.copyFromContent(string);
    if (this.temp.length === 0) {
      this.toastr.info('No data to copy');
    } else {
      this.toastr.success('Copied ' + this.temp.length + 'rows succesfully');
    }
  }
}
