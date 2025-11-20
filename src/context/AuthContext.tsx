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
  const [loading, setLoading] = useState(false);
  const [{ token, x }, setXToken] = useState({ token: `X${ulid()}`, x: '' });

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
      // const body = {
      //   ExpUsersAlias: {
      //     ds: "ExpUsers",
      //     query: {
      //       filter: [
      //         { email: { is: email.trim().toLowerCase() } },
      //         { password: { is: password } },
      //       ],
      //       projection: { id: 1, name: 1, email: 1 },
      //       sort: { id: 1 },
      //       offset: 0,
      //       limit: 1,
      //     },
      //   },
      // };

      // const res = await fetch(API_BASE, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: AUTH_TOKEN,
      //     "x-api-key": XAPI_KEY,
      //     "X-Application": APP_NAME,
      //     Accept: "application/json",
      //   },
      //   body: JSON.stringify(body),
      // });
  console.log(email,password)

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

      // if (!res.ok) {
      //   const text = await res.text().catch(() => "");
      //   throw new Error(
      //     `Login failed (status ${res.status})${text ? `: ${text}` : ""}`
      //   );
      // }

      // const json = await res.json();
      // if (json?.status !== "OK") {
      //   const errMsg =
      //     json?.message || "Login failed. Server returned non-OK status.";
      //   throw new Error(errMsg);
      // }

      // const returnedUser = json?.data?.ExpUsersAlias?.data?.[0] ?? null;

      // if (!returnedUser) {
      //   throw new Error("Invalid credentials or user not found.");
      // }

      // const returnedToken = json?.token || json?.authToken || null;

      setUser({email,x:r.x,jwt:r.jwt});
    
      //setToken(returnedToken);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    //setToken(null);
  };

  // token,
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
const encrypt = (input: string): string => { return btoa(input);}



