export interface Provider {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  cityId: string;
  address: string | null;
  description: string | null;
  picturePath: string | null;
  featured: boolean;
  active: boolean;
  paidUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
