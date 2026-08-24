import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
  loadingIndicator: boolean = true;
  rows: [] = [];
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
        this.rows = response;
        this.temp = [...response];
        this.loadingIndicator = false;
      },
      error: (err) => {
        console.error('Error loading configurations', err)
      }
    })
  }
}
