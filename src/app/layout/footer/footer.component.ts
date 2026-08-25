import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.sass'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
