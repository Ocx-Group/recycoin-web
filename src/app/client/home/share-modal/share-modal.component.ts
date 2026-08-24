import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {InlineShareButtonsConfig, SharethisAngularModule} from 'sharethis-angular';


@Component({
    selector: 'app-share-modal',
    templateUrl: './share-modal.component.html',
    standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SharethisAngularModule]
})
export class ShareModalComponent {
  inlineShareButtonsConfig: InlineShareButtonsConfig;
  @ViewChild('shareModal', { static: true }) private modalContent: TemplateRef<any>;


  constructor(private modalService: NgbModal,) {

  }

  openShareModal(url: string) {
    navigator.clipboard.writeText(url);
    this.inlineShareButtonsConfig = this.createShareConfig(url);
    this.modalService.open(this.modalContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });
  }

  createShareConfig(url: string): InlineShareButtonsConfig {
    return {
      alignment: 'center',
      color: 'social',
      enabled: true,
      font_size: 15,
      labels: 'counts',
      language: 'en',
      networks: [
        'whatsapp',
        'linkedin',
        'messenger',
        'facebook',
        'twitter',
        'telegram',
        'pinterest',
        'reddit',
        'tumblr',
        'vk',
        'email'
      ],
      padding: 5,
      radius: 4,
      show_total: true,
      size: 80,
      url: url
    };
  }

}
