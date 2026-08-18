export interface TreeNode {
  // Node
  children: TreeNode[];
  hideChildren?: boolean;
  onClick?: () => void;
  // CSS
  cssClass?: string;
  css?: string;
}

export interface MyTreeNode extends TreeNode {
  id: number;
  userName?: string;
  /** @deprecated payload legacy en snake_case */
  user_name?: string;
  description?: string;
  imageProfileUrl?: string;
  /** @deprecated el backend nuevo envia imageProfileUrl */
  image?: string;
  children: MyTreeNode[];
}

export interface MyTreeNodeClient extends TreeNode {
  id: number;
  userName?: string;
  /** @deprecated payload legacy en snake_case */
  user_name?: string;
  description?: string;
  imageProfileUrl?: string;
  /** @deprecated el backend nuevo envia imageProfileUrl */
  image?: string;
  children: MyTreeNodeClient[];
  qualificationCount?: number;
}
