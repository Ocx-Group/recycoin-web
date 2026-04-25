import { FaceApiService } from '@app/core/service/face-api-service/face-api.service';
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Country } from '@app/core/models/country-model/country.model';
import { UpdateImageIdPath } from '@app/core/models/user-affiliate-model/update-image-id-path.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TranslateModule } from '@ngx-translate/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ObjectStorageService } from '@app/core/service/object-storage-service/object-storage.service';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxDropzoneModule, TranslateModule, NgbNavModule]
})
export class EditUserComponent implements OnInit, OnDestroy {
  public user: UserAffiliate = new UserAffiliate();
  public userCookie: UserAffiliate;
  updateImageIdPath: UpdateImageIdPath = new UpdateImageIdPath();
  private ngUnsubscribe = new Subject<void>();
  updateUserForm: FormGroup;
  listcountry: Country[] = [];
  loadingIndicator = true;
  reorderable = true;
  active = 1;
  files: File[] = [];
  uploadTask: any;
  fileRef: any;
  private isUploadCompleted = false;
  progress = 0;
  displayBirthday: string | null = null;

  @ViewChild('table') table: DatatableComponent;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private affiliateService: AffiliateService,
    private formBuilder: FormBuilder,
    private objectStorageService: ObjectStorageService,
    private faceApiService: FaceApiService
  ) {}

  ngOnInit(): void {
    this.faceApiService
      .getFunctionUpload()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.startUpload();
      });

    this.userValidations();
    this.fetchCountry();
    this.getUserInfo();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  showError(message) {
    this.toastr.error(message, 'Error!');
  }

  showSuccess(message) {
    this.toastr.success(message, 'Success!');
  }

  userValidations() {
    this.updateUserForm = this.formBuilder.group({
      identification: ['', Validators.required],
      user_name: new FormControl({ value: '', disabled: true }),
      name: new FormControl({ value: '', disabled: true }),
      last_name: new FormControl({ value: '', disabled: true }),
      email: new FormControl({ value: '', disabled: true }),
      father: new FormControl({ value: '', disabled: true }),
      phone: ['', Validators.required],
      address: [],
      country: [],
      tax_id: [],
      zip_code: [],
      created_at: new FormControl({ value: '', disabled: true }),
      birthday: [],
      beneficiary_name: [],
      legal_authorized_first: [],
      legal_authorized_second: [],
      side: [],
      beneficiary_email: [],
      beneficiary_phone: [],
    });
  }

  setValues(affiliate: UserAffiliate) {
    let formattedBirthday = null;
    if (affiliate.birthday) {
      const birthdayDate = new Date(affiliate.birthday);

      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      this.displayBirthday = birthdayDate.toLocaleDateString('es-ES', options);

      formattedBirthday = birthdayDate.toISOString().split('T')[0];
      this.updateUserForm.get('birthday').setValue(formattedBirthday);
      this.updateUserForm.get('birthday').disable();
    }

    if (affiliate.identification) {
      this.updateUserForm.get('identification').setValue(affiliate.identification);
      this.updateUserForm.get('identification').disable();
    }

    if (affiliate.tax_id) {
      this.updateUserForm.get('tax_id').setValue(affiliate.tax_id);
      this.updateUserForm.get('tax_id').disable();
    }

    if (affiliate.beneficiary_name) {
      this.updateUserForm.get('beneficiary_name').setValue(affiliate.beneficiary_name);
      // this.updateUserForm.get('beneficiary_name').disable();
    }

    if (affiliate.legal_authorized_first) {
      this.updateUserForm.get('legal_authorized_first').setValue(affiliate.legal_authorized_first);
      this.updateUserForm.get('legal_authorized_first').disable();
    }

    if (affiliate.legal_authorized_second) {
      this.updateUserForm.get('legal_authorized_second').setValue(affiliate.legal_authorized_second);
      this.updateUserForm.get('legal_authorized_second').disable();
    }

    this.updateUserForm.setValue({
      identification: affiliate.identification,
      user_name: affiliate.user_name,
      name: affiliate.name,
      last_name: affiliate.last_name,
      email: affiliate.email,
      side: affiliate.binary_matrix_side.toString() ?? 0,
      father: affiliate.father_user_level ? affiliate.father_user_level.user_name ?? '' : '',
      phone: affiliate.phone,
      address: affiliate.address ?? '',
      tax_id: affiliate.tax_id ?? '',
      country: affiliate.country,
      zip_code: affiliate.zip_code,
      created_at: affiliate.created_at,
      birthday: formattedBirthday,
      beneficiary_name: affiliate.beneficiary_name ?? '',
      legal_authorized_first: affiliate.legal_authorized_first ?? '',
      legal_authorized_second: affiliate.legal_authorized_second ?? '',
      beneficiary_email: affiliate.beneficiary_email ?? '',
      beneficiary_phone: affiliate.beneficiary_phone ?? '',
    });
  }

  checkAndDisableInput() {}

  getUserInfo() {
    this.userCookie = this.authService.currentUserAffiliateValue;
    this.setValues(this.userCookie);
    this.affiliateService.getAffiliateById(this.userCookie.id).subscribe(response => {
      if (response.success) {
        this.user = response.data;
        this.setValues(this.user);
      }
    });
  }

  private fetchCountry() {
    this.affiliateService.getCountries().subscribe(data => {
      this.listcountry = data;
    });
  }

  onSelect(event) {
    if (this.files.length === 0) {
      this.files.push(...event.addedFiles);
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onSaveUser() {
    let userUpdate = new UserAffiliate();

    userUpdate.identification = this.updateUserForm.get('identification').value;
    userUpdate.phone = this.updateUserForm.get('phone').value;
    userUpdate.binary_matrix_side = this.updateUserForm.get('side').value;
    userUpdate.address = this.updateUserForm.get('address').value;
    userUpdate.zip_code = this.updateUserForm.get('zip_code').value;
    userUpdate.country = this.updateUserForm.get('country').value;
    userUpdate.birthday = this.updateUserForm.get('birthday').value;
    userUpdate.tax_id = this.updateUserForm.get('tax_id').value;
    userUpdate.beneficiary_name = this.updateUserForm.get('beneficiary_name').value;
    userUpdate.legal_authorized_first = this.updateUserForm.get('legal_authorized_first').value;
    userUpdate.legal_authorized_second = this.updateUserForm.get('legal_authorized_second').value;
    userUpdate.id = this.user.id;
    userUpdate.beneficiary_email = this.updateUserForm.get('beneficiary_email').value;
    userUpdate.beneficiary_phone = this.updateUserForm.get('beneficiary_phone').value;

    this.affiliateService.updateUserProfile(userUpdate).subscribe((response: UserAffiliate) => {
      if (response !== null) {
        this.showSuccess('La información se actualizó correctamente!');
        this.setValues(response);
      } else {
        this.showError('Error!');
      }
    });
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.addedFiles);

    if (this.files.length + files.length <= 2) {
      this.files.push(...files);

      if (this.files.length == 2) {
        // this.faceApiService.verifyImagesWithSsdMobilenetv1(this.files)
        //   .then(result => {
        //     const canvasSelfieURL = result.canvasSelfie.toDataURL();
        //     const canvasIdDocumentURL = result.canvasIdDocument.toDataURL();

        //     const title = result.matched ? '¡Éxito! Las imágenes coinciden.' : 'Error: Las imágenes no coinciden.';

        //     Swal.fire({
        //       title: title,
        //       html: `
        //         <div style="display: flex; justify-content: space-between;">
        //           <img src="${canvasSelfieURL}" alt="Selfie" style="max-width: 45%; margin-right: 5%;" />
        //           <img src="${canvasIdDocumentURL}" alt="ID Document" style="max-width: 45%;" />
        //         </div>
        //         <div style="margin-top: 20px;">
        //           Distancia Euclidiana: ${result.distance.toFixed(2)} <br>
        //           Confianza mínima (minConfidence): 0.5
        //         </div>
        //       `,
        //       icon: result.matched ? 'success' : 'error'
        //     });

        // if (result.matched) {
        this.updateCardIdAuthorization(1);
        this.user.card_id_authorization = true;
        this.authService.setUserAffiliateValue(this.user);
      } else {
        // this.updateCardIdAuthorization(1);
        // this.user.card_id_authorization = true;
        // this.authService.setUserAffiliateValue(this.user);
      }
      // });
    } else {
      this.showError('Error: demasiados archivos seleccionados.');
      this.updateCardIdAuthorization(0);
    }
  }

  private updateProgress(snapshot): void {
    this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  }

  private handleError(error): void {
    this.toastr.error('Upload failed');
  }

  private handleComplete(): void {
    const folder = `affiliates/${this.user.user_name}`;
    this.objectStorageService.uploadAccountImage(this.files[0], folder, `${this.user.id}`).subscribe({
      next: (downloadURL) => this.updateAffiliateImage(downloadURL),
      error: (err) => this.handleUpdateError(err)
    });
  }

  private async updateAffiliateImage(downloadURL: string): Promise<void> {
    this.updateImageIdPath.image_id_path = downloadURL;
    this.updateImageIdPath.id = this.user.id;

    try {
      await this.affiliateService.updateImageIdPath(this.updateImageIdPath).toPromise();
      this.handleUpdateSuccess();
    } catch (err) {
      this.handleUpdateError(err);
    }
  }

  private handleUpdateSuccess(): void {
    if (!this.isUploadCompleted) {
      this.toastr.success('Image updated successfully');
      this.faceApiService.startUploadFuntion();
      this.files = [];
      this.getUserInfo();
      this.isUploadCompleted = true;
    }
  }

  private handleUpdateError(err): void {
    this.toastr.error('Error updating affiliate image');
  }

  startUpload(): void {
    this.isUploadCompleted = false;
    this.handleComplete();
  }

  deleteImage() {
    const filePath = 'affiliates/' + `${this.user.user_name}/` + `${this.user.id}`;
    this.user.image_id_path = '';
    this.updateImageIdPath.id = this.user.id;
    this.updateImageIdPath.image_id_path = this.user.image_id_path;
    this.affiliateService.updateImageIdPath(this.updateImageIdPath).subscribe({
      next: () => {
        this.showSuccess('Image deleted successfully');
        this.files = [];
      },
      error: () => {
        this.toastr.error('error');
      },
    });
  }

  deleteFile(index: number): void {
    if (this.files.length > 0 && index < this.files.length) {
      this.files.splice(index, 1);
    }
  }

  updateCardIdAuthorization(option: number) {
    this.affiliateService.updateCardIdAuthorization(this.user.id, option).subscribe({
      next: value => {
        if (value.card_id_authorization) {
          this.showSuccess('Afiliado verificado correctamente');
        } else {
          this.showError('Su verificación se encuentra pendiente');
        }
      },
      error: err => {
        this.showError('No se pudo verificar el afiliado');
      },
    });
  }
}
