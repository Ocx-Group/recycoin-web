import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { LoadingBarModule } from '@ngx-loading-bar/core';
@Component({
    selector: 'app-page-loader',
    templateUrl: './page-loader.component.html',
    styleUrls: ['./page-loader.component.sass'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LoadingBarModule]
})
export class PageLoaderComponent implements OnInit {
  constructor() { }
  ngOnInit() { }
}
