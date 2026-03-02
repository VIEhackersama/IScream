/**
 * Shared TypeScript types and interfaces.
 * Add domain models here as the project grows.
 */

/* ===== Recipe ===== */
export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  author: RecipeAuthor;
  createdAt: string;
}

export interface RecipeAuthor {
  id: string;
  name: string;
  avatarUrl: string;
}

/* ===== User ===== */
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: "user" | "admin";
}

/* ===== API ===== */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/* ===== Navigation ===== */
export interface NavLink {
  label: string;
  href: string;
}

/* ===== Footer ===== */
export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}
