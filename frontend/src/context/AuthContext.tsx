"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import {
    authService,
    tokenStorage,
    extractApiError,
    type LoginRequest,
    type RegisterRequest,
    type UserInfo,
} from "@/services/auth.service";

/* ─── Context shape ─────────────────────────────────────────── */
interface AuthContextValue {
    user: UserInfo | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    register: (data: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ─────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on first mount
    useEffect(() => {
        const savedUser = tokenStorage.getUser();
        if (savedUser) setUser(savedUser);
        setLoading(false);
    }, []);

    const login = useCallback(async (data: LoginRequest) => {
        try {
            const res = await authService.login(data);
            setUser(res.user);
        } catch (err) {
            throw new Error(extractApiError(err, "Login failed."));
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const register = useCallback(async (data: RegisterRequest) => {
        try {
            await authService.register(data);
        } catch (err) {
            throw new Error(extractApiError(err, "Registration failed."));
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                loading,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/* ─── Hook ─────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
