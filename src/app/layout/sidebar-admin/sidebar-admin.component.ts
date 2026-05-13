import { UserService } from '@app/core/service/user-service/user.service';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { DOCUMENT, CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ROUTESADMIN } from './sidebar-admin-items';
import { AuthService } from 'src/app/core/service/authentication-service/auth.service';
import { User } from '@app/core/models/user-model/user.model';
import { RouteInfo } from './sidebar-admin.metadata';
import { ImageProfileModalComponent } from '@app/shared/components/image-profile-modal/image-profile-modal.component';
import { IconsModule } from '@app/shared';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.sass'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ImageProfileModalComponent,
    IconsModule,
    TranslatePipe,
    RouterLinkActive,
  ],
})
export class SidebarAdminComponent implements OnInit, OnDestroy {
  public user: User = new User();
  public userCookie: User;
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
    private readonly router: Router,
    private readonly userService: UserService,
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
    // Usar signal para obtener el usuario admin
    const user = this.authService.userAdmin();
    if (user) {
      this.user = user;
      this.getUserInfo();
    }

    if (this.authService.currentUserAdminValue) {
      this.user = this.authService.currentUserAdminValue;
      this.initializeSidebar();
    }
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
    this.getCurrentUser();
    this.getUserInfo();
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  initializeSidebar() {
    if (this.user?.rol_name) {
      this.sidebarItems = this.filterRoutesByRole(
        ROUTESADMIN,
        this.user.rol_name,
      );
    } else {
      this.sidebarItems = [];
    }
    this.initLeftSidebar();
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

  getCurrentUser() {
    let result = localStorage.getItem('currentUserAdmin');
    this.userCookie = JSON.parse(result);
  }

  getUserInfo() {
    this.userService.getUser(this.user).subscribe(response => {
      if (response.success) {
        this.user = response.data;
      }
    });
  }

  filterRoutesByRole(routes: RouteInfo[], userRole: string): RouteInfo[] {
    if (userRole === 'SUPER_ADMIN') {
      return routes;
    }

    const filteredRoutes: RouteInfo[] = [];

    for (const route of routes) {
      const routeCopy = { ...route };

      if (routeCopy.submenu && routeCopy.submenu.length > 0) {
        routeCopy.submenu = this.filterRoutesByRole(
          routeCopy.submenu,
          userRole,
        );
      }

      const hasAccess = !routeCopy.roles || routeCopy.roles.includes(userRole);

      if (hasAccess) {
        if (
          routeCopy.class === 'menu-toggle' &&
          (!routeCopy.submenu || routeCopy.submenu.length === 0)
        ) {
          // Skip empty menu-toggle items
        } else {
          filteredRoutes.push(routeCopy);
        }
      }
    }

    return filteredRoutes;
  }
}
