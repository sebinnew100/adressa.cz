export interface Provider {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  cityId: string;
  description: string | null;
  picturePath: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}
