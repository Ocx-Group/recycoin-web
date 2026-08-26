import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class NewsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
