import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { loginRequest } from "@/services/auth";

type LoginInput = {
  nik: string;
  password: string;
  location: { lat: number; long: number };
};

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: ({ token, user }) => login(token, user),
  });
}
