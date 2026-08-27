import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {NgxSpinnerComponent, NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MyTreeNode} from "../../../core/models/unilevel-tree-model/tree-node";
import {AffiliateService} from "../../../core/service/affiliate-service/affiliate.service";
import {TranslatePipe} from "@ngx-translate/core";
import {
  BinaryGenealogicalTreeComponent
} from "../binary-genealogical-tree-component/binary-genealogical-tree.component";


@Component({
  selector: 'app-page-binary-genealogical-tree',
  templateUrl: './page-binary-genealogical-tree.component.html',
  styleUrls: ['./page-binary-genealogical-tree.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    BinaryGenealogicalTreeComponent,
    RouterLink,
    NgxSpinnerComponent
]
})
export class PageBinaryGenealogicalTreeComponent implements OnInit {

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
    private cdr: ChangeDetectorRef
  ) {
    this.typeSelected = 'cube-transition';
  }


  ngOnInit() {
    this.userId = +this.activatedRoute.snapshot.params.id;
    this.onloadFamilyTree(this.userId);
  }


  public onloadFamilyTree(id: number) {
    this.showDiv = false;
    this.spinnerService.show();

    this.tree = {
      id: 0,
      userName: '',
      imageProfileUrl: '',
      children: [],
    };
    this.affiliateService.getBinaryTree(id).subscribe({
      next: (users: MyTreeNode) => {
        if (users !== null) {
          this.tree = this.initializeTreeNode(users);
          this.cdr.markForCheck();
          setTimeout(() => {
            this.spinnerService.hide();
            this.showDiv = true;
            this.cdr.markForCheck();
          }, 500);
        } else {
          console.error('El arbol binario llego vacio para el afiliado', id);
          this.spinnerService.hide();
        }
      },
      error: error => {
        console.error('Error loading binary tree:', error);
        this.spinnerService.hide();
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
