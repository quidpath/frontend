/** Backend login response */
export interface LoginResponse {
  access: string;
  refresh: string;
  otp_required?: boolean;
  organisation_id?: string | null;
  role?: string | null;
}

/** Backend get_profile user payload */
export interface ProfileCorporate {
  id: string | null;
  name: string;
  logo?: string;
  [key: string]: unknown;
}

export interface ProfileRole {
  id: number;
  name: string;
}

export interface MenuSection {
  id: string;
  label: string;
  path: string;
  icon?: string | null;
  children?: { id: string; label: string; path: string }[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string;
  corporate: ProfileCorporate;
  role: ProfileRole | null;
  menu: MenuSection[];
  is_superuser?: boolean;
  user_permissions?: string[];
  [key: string]: unknown;
}

/** Backend get_profile response */
export interface GetProfileResponse {
  user: UserProfile;
}
