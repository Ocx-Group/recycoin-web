import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DOCUMENT, CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';

import { ROUTES } from './sidebar-items';
import { AuthService } from 'src/app/core/service/authentication-service/auth.service';
import { UserAffiliate } from '@app/core/models/user-affiliate-model/user.affiliate.model';
import { AffiliateService } from '@app/core/service/affiliate-service/affiliate.service';
import { GradingService } from '@app/core/service/grading-service/grading.service';
import { Grading } from '@app/core/models/grading-model/grading.model';
import { LogoComponent } from '../logo/logo.component';
import { ImageProfileModalComponent } from '@app/shared/components/image-profile-modal/image-profile-modal.component';
import { IconsModule } from '@app/shared';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LogoComponent,
    ImageProfileModalComponent,
    IconsModule,
    TranslatePipe,
    RouterLinkActive,
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public user: UserAffiliate = new UserAffiliate();
  public grading: Grading = new Grading();
  public sidebarItems: any[];
  public innerHeight: any;
  public bodyTag: any;
  listMaxHeight: string;
  listMaxWidth: string;
  headerHeight = 60;
  routerObj = null;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2,
    public elementRef: ElementRef,
    private readonly authService: AuthService,
    private readonly affiliateService: AffiliateService,
    private readonly gradingService: GradingService,
    private readonly router: Router,
  ) {
    this.routerObj = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
        this.sidebbarClose();
      }
    });
  }

  @HostListener('window:resize')
  windowResizecall() {
    if (window.innerWidth < 1025) {
      this.renderer.removeClass(this.document.body, 'side-closed');
    }
    this.setMenuHeight();
    this.checkStatuForResize();
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
      this.sidebbarClose();
    }
  }

  callToggleMenu(event: any, length: any) {
    if (length > 0) {
      const parentElement = event.target.closest('li');
      const activeClass = parentElement.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }

  ngOnInit() {
    const user = this.authService.userAffiliate();
    if (user) {
      this.user = user;
      this.refreshUserInfoData(this.user.id);
    }

    if (this.user) {
      this.sidebarItems = ROUTES.filter(Boolean);
    }

    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  initLeftSidebar() {
    // Set menu height
    this.setMenuHeight();
    this.checkStatuForResize();
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  checkStatuForResize() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-gone');
    }
  }

  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }

  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  sidebbarClose() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    }
  }

  refreshUserInfoData(id: number) {
    this.affiliateService.getAffiliateById(id).subscribe({
      next: value => {
        this.user = value.data;
        this.getGradingInfo(this.user.external_grading_before_id);
      },
      error: () => {},
    });
  }

  getGradingInfo(id: number) {
    this.gradingService.getGradingById(id).subscribe(response => {
      if (response.success) {
        this.grading = response.data;
      }
    });
  }
}
