import { createContext, useMemo, ReactNode, FC, useContext } from "react";
import useAuth, { RegisterUser, LoginUser } from "../hooks/useAuth";

interface UserContextType {
  authenticated: boolean;
  registerUser: (user: RegisterUser) => Promise<void>;
  logout: () => void;
  login: (user: LoginUser) => Promise<void>;
}

const Context = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { authenticated, registerUser, logout, login } = useAuth();

  const value = useMemo(() => ({
    authenticated,
    registerUser,
    logout,
    login
  }), [authenticated, registerUser, logout, login]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useUserContext = () => {
  const context = useContext(Context);
  if (context === null) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};