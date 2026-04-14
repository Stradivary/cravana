export interface UserListItem {
  id: string;
  name: string;
  role?: string | null;
  gender: string | null;
  address: string | null;
  email: string;
  phoneNumber: string | null;
  approved: boolean;
  createdAt: string | null;
}

export interface UserDetail extends UserListItem {
  fileUrl: string | null;
}
