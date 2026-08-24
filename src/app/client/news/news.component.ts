import { Component, OnInit } from '@angular/core';

import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    standalone: true,
  imports: [RouterLink]
})
export class NewsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
