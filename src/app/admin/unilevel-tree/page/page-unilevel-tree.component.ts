import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {NgxSpinnerComponent, NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MyTreeNode} from "../../../core/models/unilevel-tree-model/tree-node";
import {AffiliateService} from "../../../core/service/affiliate-service/affiliate.service";
import {TranslatePipe} from "@ngx-translate/core";
import {UnilevelTreeComponentComponent} from "../unilevel-tree-component/unilevel-tree-component.component";


@Component({
  selector: 'app-page-unilevel-tree',
  templateUrl: './page-unilevel-tree.component.html',
  styleUrls: ['./page-unilevel-tree.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TranslatePipe,
    RouterLink,
    UnilevelTreeComponentComponent,
    NgxSpinnerComponent
]
})
export class PageUnilevelTreeComponent implements OnInit {
  userId: number;
  tree: MyTreeNode = {
    id: 0,
    userName: '',
    imageProfileUrl: '',
    children: [],
  };
  typeSelected: string;
  showDiv = false;

  constructor(
    private router: Router,
    private affiliateService: AffiliateService,
    private spinnerService: NgxSpinnerService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.typeSelected = 'cube-transition';
  }

  ngOnInit() {
    this.userId = +this.activatedRoute.snapshot.params.id;
    this.onloadFamilyTree(this.userId);
  }

  public onloadFamilyTree(id: number) {
    this.showDiv = false;
    this.spinnerService.show().then();

    this.tree = {
      id: 0,
      userName: '',
      imageProfileUrl: '',
      children: [],
    };

    this.affiliateService.getUniLevelTree(id).subscribe({
      next: (users: MyTreeNode) => {
        if (users !== null) {
          this.tree = this.initializeTreeNode(users);
          setTimeout(() => {
            this.spinnerService.hide().then();
            this.showDiv = true;
          }, 500);
        } else {
          console.error('El arbol unilevel llego vacio para el afiliado', id);
          this.spinnerService.hide().then();
        }
      },
      error: error => {
        console.error('Error loading unilevel tree:', error);
        this.spinnerService.hide().then();
      },
    });
  }

  private initializeTreeNode(node: MyTreeNode): MyTreeNode {
    if (!node) return node;

    node.hideChildren ??= false;

    if (!node.children) {
      node.children = [];
    }

    if (node.children.length > 0) {
      node.children = node.children.map(child => this.initializeTreeNode(child));
    }

    return node;
  }
}
