// this contains all the TypeScript types and interfaces related to authentication

export type User = {
    id: number;
    username: string;
    email: string;
  };
  
  export type AuthContextType = {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
  };