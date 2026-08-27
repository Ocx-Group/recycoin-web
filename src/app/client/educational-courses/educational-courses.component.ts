import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProductsComponent } from '@app/client/products/products.component';

import { TranslatePipe } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-educational-courses',
    templateUrl: './educational-courses.component.html',
    styleUrls: ['./educational-courses.component.sass'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, NgbNavModule, ProductsComponent]
})
export class EducationalCoursesComponent implements OnInit {
  active;

  constructor() {
  }

  ngOnInit(): void {

  }

  onTabChange(newActive: number) {
    this.active = newActive;
  }
}
