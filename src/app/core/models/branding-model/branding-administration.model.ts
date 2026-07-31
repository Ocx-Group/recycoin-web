export interface BrandingAdministration {
  brandId: number;
  name: string;
  companyName: string;
  companyIdentifier: string | null;
  clientUrl: string;
  supportEmail: string;
  supportPhone: string | null;
  documentType: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  updatedAt: string;
}

export type UpdateOwnBrandingRequest = Omit<
  BrandingAdministration,
  'brandId' | 'updatedAt'
>;
