import { Routes } from '@angular/router';
import { AuthGuardAdmin } from '@app/core/guard/auth.guard.admin';
import { BrandAdministratorGuard } from '@app/core/guard/brand-administrator.guard';
import { MaintenanceGuard } from '@app/core/guard/maintenance.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'home-admin',
    loadComponent: () => import('./home/home-admin.component').then(m => m.HomeAdminComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'affiliates-list',
    loadComponent: () => import('./affiliates-list/affiliates-list.component').then(m => m.AffiliatesListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'calculate-commissions',
    loadComponent: () => import('./calculate-commissions/calculate-commissions.component').then(m => m.CalculateCommissionsComponent),
    canActivate: [AuthGuardAdmin, BrandAdministratorGuard, MaintenanceGuard],
  },
  {
    path: 'compensations-plans-configuration',
    loadComponent: () => import('./compensation-plans-configuration/compensation-plans.component').then(m => m.CompensationPlansComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'general-reports',
    loadComponent: () => import('./general-reports/general-reports.component').then(m => m.GeneralReportsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'virtual-wallet',
    loadComponent: () => import('./virtual-wallet/virtual-wallet.component').then(m => m.VirtualWalletComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'import',
    loadComponent: () => import('./import/import.component').then(m => m.ImportComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'news-admin',
    loadComponent: () => import('./news/news-admin.component').then(m => m.NewsAdminComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'products-and-services',
    loadComponent: () => import('./products-and-services/products-and-services.component').then(m => m.ProductsAndServicesComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'purchases-list',
    loadComponent: () => import('./purchases-list/purchases-list.component').then(m => m.PurchasesListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'branding',
    loadComponent: () => import('./branding/branding.component').then(m => m.BrandingComponent),
    canActivate: [AuthGuardAdmin, BrandAdministratorGuard, MaintenanceGuard],
  },
  {
    path: 'commissions-configuration',
    loadComponent: () =>
      import('./commissions-configuration/commissions-configuration.component')
        .then(m => m.CommissionsConfigurationComponent),
    canActivate: [AuthGuardAdmin, BrandAdministratorGuard, MaintenanceGuard],
  },
  {
    path: 'tickets-for-admin',
    loadComponent: () => import('./tickets/tickets-admin.component').then(m => m.TicketsAdminComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'users-list',
    loadComponent: () => import('./users-list/users-list.component').then(m => m.UsersListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'rol-list',
    loadComponent: () => import('./rol-list/rol-list.component').then(m => m.RolListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'authorize-affiliates',
    loadComponent: () => import('./authorize-affiliates/authorize-affiliates.component').then(m => m.AuthorizeAffiliatesComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'purchase-order-list',
    loadComponent: () => import('./purchase-order-list/purchase-order-list.component').then(m => m.PurchaseOrderListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'authorize-purchases',
    loadComponent: () => import('./authorize-purchases/authorize-purchases.component').then(m => m.AuthorizePurchasesComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'calculated-commissions',
    loadComponent: () => import('./calculated-commissions/calculated-commissions.component').then(m => m.CalculatedCommissionsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'commissions-paid',
    loadComponent: () => import('./commissions-paid/commissions-paid.component').then(m => m.CommissionsPaidComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'my-profile',
    loadComponent: () => import('./my-profile/my-profile.component').then(m => m.MyProfileComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'unilevel-tree/:id',
    loadComponent: () => import('./unilevel-tree/page/page-unilevel-tree.component').then(m => m.PageUnilevelTreeComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'force-genealogical-tree',
    loadComponent: () => import('./force-genealogical-tree/page/page-force-genealogical-tree.component').then(m => m.PageForceGenealogicalTreeComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'binary-genealogical-tree/:id',
    loadComponent: () => import('./binary-genealogical-tree/page/page-binary-genealogical-tree.component').then(m => m.PageBinaryGenealogicalTreeComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'arrays-configurations',
    loadComponent: () => import('./arrays-configurations/arrays-configurations.component').then(m => m.ArraysConfigurationsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'concept-list',
    loadComponent: () => import('./concept-list/concept-list.component').then(m => m.ConceptListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'califications-list',
    loadComponent: () => import('./califications-list/califications-list.component').then(m => m.CalificationsListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'incentives-list',
    loadComponent: () => import('./incentives-list/incentives-list.component').then(m => m.IncentivesListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'calculation-groups',
    loadComponent: () => import('./calculation-groups/calculation-groups.component').then(m => m.CalculationGroupsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'attributes',
    loadComponent: () => import('./attributes-list/attributes-list.component').then(m => m.AttributesListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'passive-pack',
    loadComponent: () => import('./passive-pack/passive-pack.component').then(m => m.PassivePackComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'products-services-configuration',
    loadComponent: () => import('./products-services-configurations/products-services-configurations.component').then(m => m.ProductsServicesConfigurationsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'balance-of-wallet',
    loadComponent: () => import('./Balance-of-wallet/balance-of-wallet.component').then(m => m.BalanceOfWalletComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'wallet-refill',
    loadComponent: () => import('./wallet-refill/wallet-refill.component').then(m => m.WalletRefillComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'wallet-removal',
    loadComponent: () => import('./wallet-removal/wallet-removal.component').then(m => m.WalletRemovalComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'transactions-commission',
    loadComponent: () => import('./transactions-commission/transactions-commission.component').then(m => m.TransactionsCommissionComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'wallet-parameters',
    loadComponent: () => import('./wallet-parameters/wallet-parameters.component').then(m => m.WalletParametersComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'results-ecopool',
    loadComponent: () => import('./results-ecopool/results-ecopool.component').then(m => m.ResultsEcopoolComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'authorize-returns',
    loadComponent: () => import('./authorize-returns/authorize-returns.component').then(m => m.AuthorizeReturnsComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'walkways-benches',
    loadComponent: () => import('./walkways-benches/walkways-benches.component').then(m => m.WalkwaysBenchesComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'wire-transfer-list',
    loadComponent: () => import('./wire-transfer-list/wire-transfer-list.component').then(m => m.WireTransferListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'educational-programs-control',
    loadComponent: () => import('./educational-programs-control/educational-programs-control.component').then(m => m.EducationalProgramsControlComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'change-model',
    loadComponent: () => import('./change-model/change-model.component').then(m => m.ChangeModelComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'ticket-for-admin/message',
    loadComponent: () => import('./tickets/tick-view/ticket-view-admin.component').then(m => m.TicketViewAdminComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
  {
    path: 'matrix-configuration',
    loadComponent: () => import('./matrix-configuration/matrix-list/matrix-list.component').then(m => m.MatrixListComponent),
    canActivate: [AuthGuardAdmin, MaintenanceGuard],
  },
];

