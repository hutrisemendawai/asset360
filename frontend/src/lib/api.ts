// API client for communicating with the Spring Boot backend

const API_BASE = '/api';

export interface User {
  id: number;
  email: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  identityNumber: string;
  phoneNumber: string;
  address: string;
  region: string;
}

export interface Location {
  locationId: number;
  locationName: string;
  region: string;
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface AssetCategory {
  categoryId: number;
  categoryName: string;
}

export interface Asset {
  assetId: number;
  fixedAssetCode: string;
  assetName: string;
  assetValue: number;
  purchaseDate: string;
  location: Location;
  category: AssetCategory;
  department: Department;
}

export interface AssetAssignment {
  assignmentId: number;
  asset: Asset;
  assignedDepartment: Department;
  assignedDate: string;
  returnDate: string | null;
}

export interface AssetTransferRequest {
  id: number;
  asset: Asset;
  fromLocation: Location;
  toLocation: Location;
  fromDepartment: Department;
  toDepartment: Department;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
  respondedAt: string | null;
}

export interface BookValueResult {
  fixedAssetCode: string;
  assetName: string;
  originalValue: number;
  bookValue: number;
  purchaseDate: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  identityNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  locationId: number;
  password: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch {
      // keep raw text
    }
    throw new ApiError(message, res.status);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return {} as T;
}

// Auth
export const authApi = {
  login: (data: LoginRequest) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: RegisterRequest) =>
    request<void>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    request<void>('/auth/logout', { method: 'POST' }),
  me: () =>
    request<User>('/auth/me'),
};

// Profile
export const profileApi = {
  get: () => request<User>('/profile'),
  update: (data: Partial<User> & { locationId?: number }) =>
    request<User>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// Assets
export const assetsApi = {
  list: () => request<Asset[]>('/assets'),
  get: (id: number) => request<Asset>(`/assets/${id}`),
  create: (data: {
    assetName: string;
    assetValue: number;
    purchaseDate: string;
    locationId: number;
    categoryId: number;
    departmentId: number;
  }) => request<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: {
    assetName: string;
    assetValue: number;
    purchaseDate: string;
    locationId: number;
    categoryId: number;
    departmentId: number;
  }) => request<Asset>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/assets/${id}`, { method: 'DELETE' }),
  qrcode: (id: number) => `${API_BASE}/assets/${id}/qrcode`,
};

// Locations
export const locationsApi = {
  list: () => request<Location[]>('/locations'),
  get: (id: number) => request<Location>(`/locations/${id}`),
  create: (data: { locationName: string; region: string }) =>
    request<Location>('/locations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { locationName: string; region: string }) =>
    request<Location>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/locations/${id}`, { method: 'DELETE' }),
};

// Departments
export const departmentsApi = {
  list: () => request<Department[]>('/departments'),
  get: (id: number) => request<Department>(`/departments/${id}`),
  create: (data: { departmentName: string }) =>
    request<Department>('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { departmentName: string }) =>
    request<Department>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/departments/${id}`, { method: 'DELETE' }),
};

// Asset Categories
export const categoriesApi = {
  list: () => request<AssetCategory[]>('/categories'),
  get: (id: number) => request<AssetCategory>(`/categories/${id}`),
  create: (data: { categoryName: string }) =>
    request<AssetCategory>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { categoryName: string }) =>
    request<AssetCategory>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// Asset Assignments
export const assignmentsApi = {
  list: () => request<AssetAssignment[]>('/assignments'),
  get: (id: number) => request<AssetAssignment>(`/assignments/${id}`),
  create: (data: {
    assetId: number;
    departmentId: number;
    assignedDate: string;
    returnDate?: string;
  }) => request<AssetAssignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: {
    assetId: number;
    departmentId: number;
    assignedDate: string;
    returnDate?: string;
  }) => request<AssetAssignment>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/assignments/${id}`, { method: 'DELETE' }),
};

// Asset Transfers
export const transfersApi = {
  create: (data: {
    assetId: number;
    toLocationId: number;
    toDepartmentId: number;
  }) => request<AssetTransferRequest>('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  pending: () => request<AssetTransferRequest[]>('/transfers/pending'),
  accept: (id: number) =>
    request<void>(`/transfers/${id}/accept`, { method: 'POST' }),
  reject: (id: number) =>
    request<void>(`/transfers/${id}/reject`, { method: 'POST' }),
};

// Book Value
export const bookValueApi = {
  calculate: (assetIds: number[], asOfDate: string) =>
    request<BookValueResult[]>('/book-value', {
      method: 'POST',
      body: JSON.stringify({ assetIds, asOfDate }),
    }),
};

export { ApiError };
