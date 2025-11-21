import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ulid } from "ulid";

type User = {
  id?: string;
  name?: string;
  email?: string;
  x:string;
  jwt:string;
};

type AuthContextType = {
  user: User | null;
  //token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "sessionUser";
const LOGIN_FLAG = "isLoggedIn";


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

async function preValidate(token: string): Promise<string> {
  
  const response = await fetch(`https://dev.cloudio.io/v1/x`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-Application': 'SignIn',
      'Content-Type': 'application/json',
      'X-Token': token,
    },
    body: JSON.stringify({ x: token }),
  });
  if (response.ok) {
    const { x } = await response.json();
    return x;
  } else {
    const text = await response.text();
    throw new Error(
      `Unable to perform pre validation. Server Response: ${text}`,
    );
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  //const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [{ token, x }, setXToken] = useState({ token: `X${ulid()}`, x: '' });

  useEffect(() => {
    const flag = localStorage.getItem(LOGIN_FLAG);
    const stored = localStorage.getItem(SESSION_KEY);

    if (flag === "true" && stored) {
      setUser(JSON.parse(stored));
    }

    setLoading(false);
  }, []);
  const API_BASE = process.env.REACT_APP_CLOUDIO_BASE;
  const AUTH_TOKEN = process.env.REACT_APP_CLOUDIO_AUTH_TOKEN;
  const XAPI_KEY = process.env.REACT_APP_CLOUDIO_XAPIKEY;
  const APP_NAME = process.env.REACT_APP_CLOUDIO_APPNAME || "Training";
  useEffect(() => {
 
    preValidate(token)
      .then( (x_token) => {
       setXToken({token,x:x_token});})
     },[])
  const login = async (email: string, password: string) => {
    if (!API_BASE || !AUTH_TOKEN || !XAPI_KEY) {
      throw new Error("App configuration missing. Contact admin.");
    }

    setLoading(true);
    try {
   console.log(token+x);
   const response = await fetch(`https://dev.cloudio.io/v1/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Application': 'SignIn',
          'Content-Type': 'application/json',
          'X-Token': `${token}${x}`,
        },
        body:  JSON.stringify({
        
              un: encrypt(email.trim()),
              pw: encrypt(password.trim()),
              is_admin_url:false,
              is_native_login: true,
            })
      });
          const r= await response.json();
          console.log('rr',r,r.x)
       if (r.status === 'OK') {

       }else{
        throw new Error(
          `Login failed `
        );
       }

      const u: User = {
        id: r.userId,
        email,
        x: r.x,
        jwt: r.jwt,
      };

      setUser(u);
      localStorage.setItem(LOGIN_FLAG, "true");
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    
      //setToken(returnedToken);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user?.x) {
      const csrf = encodeURIComponent(user.x);
      try {
        await fetch(`https://dev.cloudio.io/v1/signout?x=${csrf}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "X-Application": "SignIn",
            "Content-Type": "application/json",
          },
        });
      } catch (err) {
        console.error("Signout error:", err);
      }
    }

    localStorage.removeItem(LOGIN_FLAG);
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
const encrypt = (input: string): string => { return btoa(input);}



