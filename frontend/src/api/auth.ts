import { request } from './request';

export enum RegisterAccountType {
  GUEST = 'guest',
  BREEDER = 'breeder',
}

export enum BreederType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  ORGANIZATION = 'organization',
  RESEARCH_INSTITUTE = 'research_institute',
}

export enum BreederStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

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
  accountType: RegisterAccountType;
}

export interface BreederRegisterParams extends RegisterParams {
  breederType: BreederType;
  realName: string;
  idCardNumber?: string;
  companyName?: string;
  businessLicense?: string;
  address?: string;
  contactPhone?: string;
  description?: string;
  credentials?: string;
}

export interface BreederInfo {
  id: string;
  type: BreederType;
  realName: string;
  idCardNumber?: string;
  companyName?: string;
  businessLicense?: string;
  address?: string;
  contactPhone?: string;
  description?: string;
  credentials?: string;
  status: BreederStatus;
  certificationNumber?: string;
  certifiedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
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
  lastLoginIp?: string;
  lastLoginAt?: string;
  breeder?: BreederInfo;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: UserInfo;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface BreederListResult {
  data: Array<BreederInfo & { user: UserInfo }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BreederStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  individual: number;
  company: number;
}

export interface ReviewBreederParams {
  reviewNote?: string;
}

export const authApi = {
  login(data: LoginParams) {
    return request.post<AuthResult>('/auth/login', data);
  },
  register(data: RegisterParams) {
    return request.post<AuthResult>('/auth/register', data);
  },
  registerBreeder(data: BreederRegisterParams) {
    return request.post<AuthResult>('/auth/register/breeder', data);
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
  uploadCredentials(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<UploadResult>('/upload/credentials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBreederList(params?: {
    status?: BreederStatus;
    type?: BreederType;
    page?: number;
    limit?: number;
  }) {
    return request.get<BreederListResult>('/breeders', { params });
  },
  getBreederStatistics() {
    return request.get<BreederStatistics>('/breeders/statistics');
  },
  getBreederDetail(id: string) {
    return request.get<BreederInfo & { user: UserInfo }>(`/breeders/${id}`);
  },
  approveBreeder(id: string, data: ReviewBreederParams) {
    return request.put<BreederInfo>(`/breeders/${id}/approve`, data);
  },
  rejectBreeder(id: string, data: ReviewBreederParams) {
    return request.put<BreederInfo>(`/breeders/${id}/reject`, data);
  },
  suspendBreeder(id: string, data: ReviewBreederParams) {
    return request.put<BreederInfo>(`/breeders/${id}/suspend`, data);
  },
};

export default authApi;
