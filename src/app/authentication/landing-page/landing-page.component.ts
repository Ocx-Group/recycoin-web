import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy
} from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { AuthService } from '@app/core/service/authentication-service/auth.service';
import { PdfViewerService } from '@app/core/service/pdf-viewer-service/pdf-viewer.service';
import { SafePipe } from '@app/shared/pipes/safe.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('slideInOut', [
      state(
        'in',
        style({
          transform: 'translateX(0)',
        }),
      ),
      state(
        'out',
        style({
          transform: 'translateX(100%)',
        }),
      ),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out')),
    ]),
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [ToastrService],
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, SafePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  isNavbarVisible = false;
  documents = {
    whitePaper: {
      url: 'assets/pdf/WhitePaper-2025.pdf',
      title: 'White Paper - RecyCoin',
    },
    legalDoc: {
      url: 'assets/pdf/LEGAL-DOCUMENTATION.pdf',
      title: 'Documentos Legales - RecyCoin',
    },
    recycoinProject: {
      url: 'assets/pdf/PROJECT.pdf',
      title: 'Proyecto RecyCoin',
    },
  };
  showVideoModal: boolean = false;
  currentVideoUrl: string = '';
  currentLang: string = 'en';
  isLanguageDropdownOpen: boolean = false;
  key: string = '';
  videos = {
    es: {
      url: '',
      title: 'Ver Video Informativo',
    },
    en: {
      url: '',
      title: 'Watch Information Video',
    },
  };
  isPreviewHovered: boolean = false;
  user: UserAffiliate | null = null;

  constructor(
    private readonly pdfViewerService: PdfViewerService,
    private readonly translate: TranslateService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly affiliateService: AffiliateService,
    private readonly authService: AuthService,
  ) {
    translate.setFallbackLang('en');
    this.currentLang = translate.getCurrentLang() || 'en';
    this.key = this.activatedRoute.snapshot.params.key;

    // Si hay un usuario logueado, usar sus datos
    const loggedUser = this.authService.userAffiliate();
    if (loggedUser) {
      this.user = loggedUser;
    } else if (this.key) {
      // Si no hay usuario logueado pero hay key en la ruta, buscar por username
      this.getUserByUsername(this.key);
    }
  }

  ngOnInit() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.changeLanguage(savedLang);
    } else {
      this.changeLanguage('en');
    }

    setTimeout(() => {
      this.triggerAutomaticVideo();
    }, 2000);
  }

  ngOnDestroy() {
    this.closeVideo();
  }

  triggerAutomaticVideo(): void {
    this.showPreview();
    this.showVideo();
  }

  getUserByUsername(key: string) {
    if (!key) return;
    this.affiliateService
      .getAffiliateByUserName(key)
      .subscribe((user: UserAffiliate) => {
        if (user !== null) {
          this.user = user;
        }
      });
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.isLanguageDropdownOpen = false;
  }

  toggleLanguageDropdown(event: Event) {
    event.stopPropagation();
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: any) {
    const clickedElement = event.target as HTMLElement;
    const isLanguageSelector = clickedElement.closest('.language-selector');
    if (!isLanguageSelector) {
      this.isLanguageDropdownOpen = false;
    }
  }

  showDocument(docType: 'whitePaper' | 'legalDoc' | 'recycoinProject'): void {
    const document = this.documents[docType];
    this.pdfViewerService.showPdf(document);
  }

  toggleNavbar() {
    this.isNavbarVisible = !this.isNavbarVisible;
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  showVideo(): void {
    const videoId = this.videos[this.currentLang].url;

    this.currentVideoUrl = ``;
    this.showVideoModal = true;
  }

  closeVideo(): void {
    this.showVideoModal = false;
    this.currentVideoUrl = '';
    document.body.style.overflow = 'auto';
    this.hidePreview();
  }

  showPreview(): void {
    this.isPreviewHovered = true;
  }

  hidePreview(): void {
    this.isPreviewHovered = false;
  }
}
