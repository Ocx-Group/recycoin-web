import { Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { TermsConditionsService } from '@app/core/service/terms-conditions-service/terms-conditions.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'app-terms-conditions-modal',
    templateUrl: './terms-conditions-modal.component.html',
    styleUrls: ['./terms-conditions-modal.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class TermsConditionsModalComponent implements OnInit, OnDestroy {
  @ViewChild('termsModal', { static: true }) termsModal: TemplateRef<any>;
  @ViewChild('acceptButton', { static: false }) acceptButton: ElementRef;
  showButton: boolean = false;
  private destroy$ = new Subject<void>();
  user: UserAffiliate = new UserAffiliate();

  constructor(
    private termsConditionsService: TermsConditionsService,
    private modalService: NgbModal,
    private renderer: Renderer2,
    private affiliateService: AffiliateService,
    private authService: AuthService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUserAffiliateValue;
    this.termsConditionsService.showModal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.modalService.open(this.termsModal, { backdrop: 'static', keyboard: false, centered: true });
      });
  }

  ngOnDestroy(): void {
    this.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    const modalBodyScroll = document.querySelector('.modal-body');
    if (modalBodyScroll) {
      this.renderer.listen(modalBodyScroll, 'scroll', (event) => {
      });
    }
  }

  showSuccess(message) {
    this.toast.success(message);
  }

  showError(message) {
    this.toast.error(message);
  }

  onScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const offsetHeight = event.target.offsetHeight;

    if (scrollTop + offsetHeight >= scrollHeight - 5) {
      this.showAcceptButton();
    }
  }

  showAcceptButton() {
    this.showButton = true;
  }

  close() {
    this.modalService.dismissAll();
  }

  acceptTerms() {
    this.user.termsConditions = true;
    this.affiliateService.updateAffiliate(this.user).subscribe({
      next: (value) => {
        this.showSuccess('Términos y condiciones actualizados correctamente');
        this.authService.setUserAffiliateValue(this.user);
        this.close();
      },
      error: (err) => {
        this.showError('Error');
      },
    })
  }
}
