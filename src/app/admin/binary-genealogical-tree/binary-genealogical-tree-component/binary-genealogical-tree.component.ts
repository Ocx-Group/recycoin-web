import {
  Component,
  Input,
  ViewEncapsulation,
  TemplateRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import {MyTreeNode} from "../../../core/models/unilevel-tree-model/tree-node";
import {NgbPopover} from "@ng-bootstrap/ng-bootstrap";
import { NgTemplateOutlet, CommonModule } from "@angular/common";

@Component({
  selector: 'app-binary-genealogical-tree',
  exportAs: 'orgChart',
  templateUrl: './binary-genealogical-tree.component.html',
  styleUrls: ['./binary-genealogical-tree.component.scss'],
  host: {
    '[class.ng13-org-chart-zoom-out]': 'zoomOut',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    CommonModule,
    NgbPopover,
    NgTemplateOutlet
  ]
})
export class BinaryGenealogicalTreeComponent {
  @Input('data') data: MyTreeNode | undefined;
  @Input() hasParent = false;
  @Input('nodeTemplate') nodeTemplate!: TemplateRef<any>;
  @Output('loadFamilyTree') loadFamilyTree: EventEmitter<number> = new EventEmitter();
  zoomOut = false;

  constructor() {
  }

  public onloadFamilyTree(id: number) {
    if (id !== 0) {
      this.loadFamilyTree.emit(id);
    }
  }
}
