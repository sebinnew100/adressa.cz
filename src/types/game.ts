export interface Mission {
  id: string;
  rewardPoints: number;
  isGrandChallenge: boolean;
  expiresAt: string;
  provider: {
    id: string;
    fullName: string;
    serviceId: string;
    cityId: string;
    picturePath: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}
