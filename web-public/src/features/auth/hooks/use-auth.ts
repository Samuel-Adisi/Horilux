import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { loginCustomer, registerCustomer, type LoginPayload, type RegisterPayload } from "../api/auth";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginCustomer(payload),
    onSuccess: (data) => {
      setAuth(data.customer, data.access, data.refresh);
      navigate("/account");
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerCustomer(payload),
    onSuccess: (data) => {
      setAuth(data.customer, data.access, data.refresh);
      navigate("/account");
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/");
  };
}
