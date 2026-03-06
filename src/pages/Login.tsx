import { useState } from "react"
import api from "../api/client"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Login(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const {login} = useAuth()

  const navigate = useNavigate()

  const submit = async(e:any)=>{

    e.preventDefault()

    const res = await api.post("/auth/login",{email,password})

    login(res.data.token)

    navigate("/")
  }

  return(

    <div className="h-screen flex items-center justify-center">

      <form onSubmit={submit} className="p-6 bg-white shadow rounded w-80">

        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
        className="border w-full p-2 mb-3"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
        />

        <input
        type="password"
        className="border w-full p-2 mb-3"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="bg-blue-600 text-white w-full p-2 rounded">
        Login
        </button>

      </form>

    </div>
  )
}