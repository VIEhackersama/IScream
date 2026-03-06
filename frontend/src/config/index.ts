export { siteConfig } from "./site";
export const routes = {
    home: "/",
    recipes: "/recipes",
    orderBooks: "/order-books",
    login: "/login",
    register: "/register",
    profile: "/profile",
    adminDashboard: "/admin/recipes",
    addRecipe: "/submit",
    feedback: "/feedback",
    contact: "/contact",
    about: "/about",
    faq: "/faq",
    privacyPolicy: "/privacy-Policy",
    careers: "/careers",
    membership: "/membership",
} as const;
