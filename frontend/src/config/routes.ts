/**
 * Central route map – keeps route strings in one place
 * so refactors only need to touch this file.
 */

export const routes = {
  home: "/",
  recipes: "/recipes",
  orderBooks: "/order-books",
  addRecipe: "/submit",
  login: "/login",
  register: "/register",
  profile: "/profile",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  feedback: "/feedback",
  privacyPolicy: "/privacy-Policy",
  careers: "/careers",
  adminLogin: "/admin/login",
  adminDashboard: "/admin",
} as const;
