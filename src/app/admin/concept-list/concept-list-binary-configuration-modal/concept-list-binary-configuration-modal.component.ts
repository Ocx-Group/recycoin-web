import {Component, ViewChild, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-concept-list-binary-configuration-modal',
  templateUrl: './concept-list-binary-configuration-modal.component.html',
  styleUrls: ['./concept-list.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule
  ]
})
export class ConceptListBinaryConfigurationModalComponent implements OnInit {
  submitted = false;
  title = 'angular13bestcode';

  @ViewChild('configBinaryModal') configBinaryModal: NgbModal;

  constructor(
  ) {
  }

  ngOnInit() {
  }
}
