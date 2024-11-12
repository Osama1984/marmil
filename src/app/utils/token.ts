import { jwtDecode as jwt_decode } from 'jwt-decode';

export function isTokenValid(token: string): boolean {
  const decoded: any = jwt_decode(token);
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return decoded.exp > currentTime;
}