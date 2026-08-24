import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderAdminComponent } from '@app/layout/header-admin/header-admin.component';
import { SidebarAdminComponent } from '@app/layout/sidebar-admin/sidebar-admin.component';
import { RightSidebarComponent } from '@app/layout/right-sidebar/right-sidebar.component';
import { FooterComponent } from '@app/layout/footer/footer.component';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
      RouterOutlet,
      HeaderAdminComponent,
      SidebarAdminComponent,
      RightSidebarComponent,
      FooterComponent
    ]
})
export class AdminLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
