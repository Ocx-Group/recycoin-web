import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AffiliateService } from '../../../core/service/affiliate-service/affiliate.service';
import { UserAffiliate } from '../../../core/models/user-affiliate-model/user.affiliate.model';
import { UpdateImageProfile } from '../../../core/models/user-affiliate-model/update-image-profile.model';
import { AuthService } from '../../../core/service/authentication-service/auth.service';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TranslateModule } from '@ngx-translate/core';
import { ObjectStorageService } from '../../../core/service/object-storage-service/object-storage.service';

@Component({
  selector: 'app-image-profile-modal',
  templateUrl: './image-profile-modal.component.html',
  styleUrls: ['./image-profile-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxDropzoneModule, TranslateModule],
})
export class ImageProfileModalComponent implements OnInit {
  public userId: number;
  @ViewChild('imageProfileModal') imageProfileModal: NgbModal;
  file: File | null = null;
  fileRef: any;
  user: UserAffiliate = new UserAffiliate();
  @Output() getInfo = new EventEmitter<void>();

  constructor(
    private readonly modalService: NgbModal,
    private readonly toastr: ToastrService,
    private readonly affiliateService: AffiliateService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserAffiliateValue;
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  openImageProfileModal(content, user: UserAffiliate) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      centered: true,
    });

    this.userId = user.id;
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  closeModals() {
    this.modalService.dismissAll();
  }

  onFileSelected(event: any): void {
    this.file = event.addedFiles[0];

    const folder = `affiliates/profile/${this.user.user_name}`;
    this.objectStorageService.uploadAccountImage(this.file, folder, `${this.user.id}`).subscribe({
      next: (downloadURL) => {
        let updateImage = new UpdateImageProfile();
        updateImage.image_profile_url = downloadURL;
        this.affiliateService
          .updateImageProfile(this.user.id, updateImage)
          .subscribe({
            next: (value: UserAffiliate) => {
              if (value) {
                this.authService.setUserAffiliateValue(value);
                this.user.image_profile_url = value.image_profile_url;
                this.getInfo.emit();
                this.showSuccess('Imagen actualizada correctamente');
              }
            },
            error: () => {
              this.showError('No se pudo actualizar la imagen de perfil');
            },
          });
      },
      error: () => this.showError('No se pudo cargar la imagen')
    });
  }

  removeImage(): void {
    let updateImage = new UpdateImageProfile();
    updateImage.image_profile_url = '';
    this.user.image_profile_url = null;
    this.file = null;

    this.affiliateService
      .updateImageProfile(this.user.id, updateImage)
      .subscribe({
        next: value => {
          if (value) {
            this.getInfo.emit();
            this.showSuccess('Imagen eliminada correctamente');
            this.authService.setUserAffiliateValue(value);
          }
        },
        error: () => {
          this.showError('La imagen no se ha eliminado');
        },
      });
  }
}
