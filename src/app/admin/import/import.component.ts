import {Component, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class ImportComponent {

}
