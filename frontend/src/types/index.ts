/**
 * Shared TypeScript types and interfaces (aligned with backend Models).
 */

/* ===== Common API Types ===== */
export interface ApiResponse<T = void> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// legacy alias used by recipe.service (PaginatedResponse wraps array)
export type PaginatedResponse<T> = ApiResponse<PagedResult<T>>;

/* ===== Recipe ===== */
export interface Recipe {
  id: string;
  flavorName: string;
  shortDescription?: string;
  ingredients?: string;
  procedure?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ===== Item (Recipe Book) ===== */
export interface Item {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

/* ===== Order ===== */
export interface ItemOrder {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  itemId: string;
  quantity: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  itemId: string;
  quantity: number;
}

/* ===== Feedback ===== */
export interface Feedback {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  message: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  name?: string;
  email?: string;
  message: string;
}

/* ===== Recipe Submission ===== */
export interface RecipeSubmission {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  title: string;
  description?: string;
  ingredients?: string;
  steps?: string;
  imageUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionRequest {
  name?: string;
  email?: string;
  title: string;
  description?: string;
  ingredients?: string;
  steps?: string;
  imageUrl?: string;
}

/* ===== Membership ===== */
export interface MembershipPlan {
  id: number;
  code: string;
  price: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
}

export interface MembershipSubscription {
  id: string;
  userId: string;
  planId: number;
  paymentId?: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  planCode?: string;
  planPrice?: number;
}

/* ===== User ===== */
export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: "MEMBER" | "ADMIN";
}

/* ===== Navigation ===== */
export interface NavLink {
  label: string;
  href: string;
  icon?: string;
  children?: NavLink[];
}

/* ===== Footer ===== */
export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}
