export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  department: string; // department id
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  department: Department;
  roles: Role[];
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserListItem {
  id: string;
  full_name: string;
  email: string;
  department_name: string | null;
}
