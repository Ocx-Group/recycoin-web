import {
  Component,
  Input,
  ViewEncapsulation,
  TemplateRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MyTreeNodeClient } from '../../../core/models/unilevel-tree-model/tree-node';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-unilevel-tree-component',
  exportAs: 'orgChart',
  templateUrl: './client-unilevel-tree-component.component.html',
  styleUrls: ['./client-unilevel-tree-component.component.scss'],
  host: {
    '[class.ng13-org-chart-zoom-out]': 'zoomOut',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgbPopover, CommonModule],
})
export class ClientUnilevelTreeComponentComponent {
  @Input() data: MyTreeNodeClient | undefined;
  @Input() hasParent = false;
  @Input() nodeTemplate!: TemplateRef<any>;
  @Output() loadFamilyTree: EventEmitter<number> = new EventEmitter();
  zoomOut = false;

  constructor() {}

  public onloadFamilyTree(id: number) {
    if (id !== 0) {
      this.loadFamilyTree.emit(id);
    }
  }

  public onClick() {
    this.data?.onClick?.();
  }

  public toggleZoom() {
    this.zoomOut = !this.zoomOut;
  }
}
