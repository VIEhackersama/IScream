/**
 * Centralized API endpoint paths.
 * All service files import paths from here instead of using hardcoded strings.
 *
 * Dynamic segments use functions: byId: (id: string) => `/items/${id}`
 */
export const API_ENDPOINTS = Object.freeze({
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    adminLogin: "/auth/admin/login",
    me: "/auth/me",
    profile: "/auth/profile",
  },
  recipes: {
    list: "/recipes",
    byId: (id: string) => `/recipes/${id}`,
  },
  items: {
    list: "/items",
    byId: (id: string) => `/items/${id}`,
  },
  orders: {
    create: "/orders",
    byId: (id: string) => `/orders/${id}`,
  },
  membership: {
    plans: "/membership/plans",
    me: "/membership/me",
    subscribe: "/membership/subscribe",
  },
  feedback: {
    create: "/feedback",
  },
  submissions: {
    create: "/submissions",
    byId: (id: string) => `/submissions/${id}`,
  },
  management: {
    recipes: {
      create: "/management/recipes",
      update: (id: string) => `/management/recipes/${id}`,
      delete: (id: string) => `/management/recipes/${id}`,
    },
    submissions: {
      list: "/management/submissions",
      review: (id: string) => `/management/submissions/${id}/review`,
    },
  },
});
