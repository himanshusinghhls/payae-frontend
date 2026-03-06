import { useState } from "react"
import api from "../api/client"
import { useNavigate } from "react-router-dom"

export default function Register(){

const navigate = useNavigate()

const [form,setForm] = useState({
name:"",
email:"",
password:""
})

async function register(){

await api.post("/auth/register",form)

navigate("/login")

}

return(

<div className="flex items-center justify-center min-h-screen bg-gray-50">

<div className="bg-white p-10 rounded-xl shadow-lg w-96">

<h2 className="text-2xl font-bold mb-6">
Create Account
</h2>

<input
className="border w-full p-2 mb-3 rounded"
placeholder="Name"
onChange={e=>setForm({...form,name:e.target.value})}
/>

<input
className="border w-full p-2 mb-3 rounded"
placeholder="Email"
onChange={e=>setForm({...form,email:e.target.value})}
/>

<input
type="password"
className="border w-full p-2 mb-3 rounded"
placeholder="Password"
onChange={e=>setForm({...form,password:e.target.value})}
/>

<button
onClick={register}
className="bg-indigo-600 text-white w-full p-2 rounded"
>
Register
</button>

</div>

</div>

)

}