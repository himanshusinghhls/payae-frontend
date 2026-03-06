import { createContext,useContext,useState,useEffect } from "react"

type AuthContextType = {
  token:string | null
  login:(token:string)=>void
  logout:()=>void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = ()=>{

  const ctx = useContext(AuthContext)

  if(!ctx){
    throw new Error("AuthContext not found")
  }

  return ctx
}

export function AuthProvider({children}:{children:any}){

  const [token,setToken] = useState<string | null>(null)

  useEffect(()=>{

    const stored = localStorage.getItem("token")

    if(stored){
      setToken(stored)
    }

  },[])

  const login = (token:string)=>{

    localStorage.setItem("token",token)
    setToken(token)

  }

  const logout = ()=>{

    localStorage.removeItem("token")
    setToken(null)

  }

  return(

    <AuthContext.Provider value={{token,login,logout}}>

      {children}

    </AuthContext.Provider>

  )

}