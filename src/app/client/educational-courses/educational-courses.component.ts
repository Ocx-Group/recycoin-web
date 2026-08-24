import { Component, OnInit } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-educational-courses',
    templateUrl: './educational-courses.component.html',
    styleUrls: ['./educational-courses.component.sass'],
    standalone: true,
    imports: [TranslateModule, NgbNavModule]
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
