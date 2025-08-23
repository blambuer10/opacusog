
export interface UserDataPermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  comingSoon?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  address?: string;
}

export interface BrowsingHistory {
  url: string;
  title: string;
  timestamp: number;
  visitCount: number;
}

export interface UserProfile {
  udid: string;
  address: string;
  permissions: UserDataPermission[];
  locationHistory: LocationData[];
  browsingHistory: BrowsingHistory[];
  createdAt: number;
}
