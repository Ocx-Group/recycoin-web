import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance-page.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class MaintenancePageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
