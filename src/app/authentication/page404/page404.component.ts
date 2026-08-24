import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.sass'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class Page404Component implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
