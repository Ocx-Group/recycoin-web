import {Component} from '@angular/core';
import {TreeNode} from "../../../core/models/unilevel-tree-model/tree-node";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";
import {ForceGenealogicalTreeComponent} from "../force-genealogical-tree-component/force-genealogical-tree.component";



interface MyTreeNode extends TreeNode {
  name: string;
  description?: string;
  image?: string;
  children: MyTreeNode[];
}

@Component({
  selector: 'app-page-force-genealogical-tree',
  templateUrl: './page-force-genealogical-tree.component.html',
  styleUrls: ['./page-force-genealogical-tree.component.scss'],
  standalone: true,
  imports: [
    TranslatePipe,
    RouterLink,
    ForceGenealogicalTreeComponent
]
})
export class PageForceGenealogicalTreeComponent {
  tree: MyTreeNode = {
    name: 'Rafael Gordon',
    image: 'assets/images/image-gallery/avatar/avatar1.png',

    children: [
      {
        name: 'Ernesto Webster',
        image: 'assets/images/image-gallery/avatar/avatar2.png',
        children: [
          {
            name: 'Gene Carson',
            image: 'assets/images/image-gallery/avatar/avatar3.png',
            children: [],
          },
          {
            name: 'Marie Alexander',
            cssClass: 'yellow-on-hover',
            image: 'assets/images/image-gallery/avatar/avatar4.png',
            children: [],
          },
          {
            name: 'Blake Briggs',
            image: 'assets/images/image-gallery/avatar/avatar2.png',
            children: [],
          },
        ],
      },
      {
        name: 'Dustin Collier',

        image: 'assets/images/image-gallery/avatar/avatar1.png',
        children: [
          {
            name: 'Erick Brock',
            image: 'assets/images/image-gallery/avatar/avatar4.png',
            children: [],
          },
          {
            name: 'Tammy Moody',
            image: 'assets/images/image-gallery/avatar/avatar3.png',
            children: [
              {
                name: 'Dwight Cummings',
                image: 'assets/images/image-gallery/avatar/avatar1.png',
                children: [
                  {
                    name: 'Néstor Fuente',
                    image: 'assets/images/image-gallery/avatar/avatar5.png',
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
