import {Component, OnInit, ChangeDetectionStrategy, signal} from '@angular/core';
import {MatrixConfigurationService} from "../../../core/service/matrix-configuration/matrix-configuration.service";
import {RouterLink} from "@angular/router";
import {IconsModule} from "../../../shared";
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from "@swimlane/ngx-datatable";
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-matrix-list',
  templateUrl: './matrix-list.component.html',
  styleUrls: ['./matrix-list.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconsModule,
    DatatableComponent,
    DataTableColumnDirective,
    DataTableColumnCellDirective,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem
  ]
})
export class MatrixListComponent implements OnInit {
  readonly loadingIndicator = signal<boolean>(true);
  readonly rows = signal<any[]>([]);
  temp = [];
  reorderable: boolean = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  constructor(private matrixConfigurationService: MatrixConfigurationService) {
  }

  ngOnInit(): void {
    this.loadAllConfigurations();
  }

  updateFilter($event: Event) {
  }

  loadAllConfigurations() {
    this.matrixConfigurationService.getAllMatrixConfigurations().subscribe({
      next: (response) => {
        this.rows.set(response);
        this.temp = [...response];
        this.loadingIndicator.set(false);
      },
      error: (err) => {
        console.error('Error loading configurations', err)
      }
    })
  }
}
