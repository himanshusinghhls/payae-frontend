import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/client"
import { useAuth } from "../context/AuthContext"

export default function Login(){

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const {login} = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e:any)=>{

    e.preventDefault()

    const res = await api.post("/auth/login",{
      email,
      password
    })

    login(res.data.token)

    navigate("/")

  }

  return(

    <div className="h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-96"
      >

        <h2 className="text-xl font-semibold mb-6">
          Login
        </h2>

        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 mb-4 rounded"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Login
        </button>

      </form>

    </div>

  )

}