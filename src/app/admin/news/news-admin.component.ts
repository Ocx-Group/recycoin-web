import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-news-admin',
  templateUrl: './news-admin.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterLink
  ]
})
export class NewsAdminComponent {

}
