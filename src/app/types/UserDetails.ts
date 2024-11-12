export interface UserDetails {
  id: string;
  email: string;
  username: string;
  address: string;
  phoneNumber: string;
  profileImage: string | null | File;
  selectedState: string;
  zipCode: string;
  exp: number; // Token expiration time in seconds
}
