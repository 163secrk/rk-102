import { request } from './request';

export interface LoginParams {
  account: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  phone?: string;
  password: string;
  nickname?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: UserInfo;
}

export const authApi = {
  login(data: LoginParams) {
    return request.post<AuthResult>('/auth/login', data);
  },
  register(data: RegisterParams) {
    return request.post<AuthResult>('/auth/register', data);
  },
  profile() {
    return request.get<UserInfo>('/auth/profile');
  },
  logout() {
    return request.post('/auth/logout');
  },
  check() {
    return request.get<{ valid: boolean; userId: string; role: string; username: string }>('/auth/check');
  },
};

export default authApi;
