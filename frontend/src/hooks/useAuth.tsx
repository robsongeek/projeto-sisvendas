// Arquivo frontend/src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import axios, { AxiosHeaderValue } from "axios";
import { toast } from "react-toastify";

interface AuthResponse {
  token: string;
}

export interface RegisterUser {
  name: string;
  email: string;
  nivel_acesso: string;
  password: string;
  [key: string]: any;
}

export interface LoginUser {
  login: string;
  senha: string;
}

export default function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        api.defaults.headers.Authorization = `Bearer ${parsedToken}`;
        setAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const authUser = async (data: AuthResponse): Promise<void> => {
    setAuthenticated(true);
    localStorage.setItem("token", JSON.stringify(data.token));
    navigate("/");
  };

  const registerUser = async (user: RegisterUser): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>("/usuarios/create", user);
      await authUser(response.data);
      toast.success("Cadastro realizado com sucesso!");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro desconhecido ao registrar usuário");
      }
    }
  };

  const login = async (user: LoginUser): Promise<void> => {
    try {
      const response = await api.post<AuthResponse>("/usuarios/login", user);
      await authUser(response.data);
      navigate("/");
      toast.success("Login realizado com sucesso!", {
        icon: <span>👋</span> 
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro desconhecido ao fazer login");
      }
    }
  };

  const logout = (): void => {
    setAuthenticated(false);
    localStorage.removeItem("token");
    api.defaults.headers.Authorization = null as unknown as AxiosHeaderValue;
    navigate("/");
    toast.success("Logout realizado com sucesso!");
  };

  return {
    authenticated,
    registerUser,
    login,
    logout,
  };
}
