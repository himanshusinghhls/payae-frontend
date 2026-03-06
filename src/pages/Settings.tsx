import { useState } from "react"
import api from "../api/client"

export default function Settings(){

const [settings,setSettings] = useState({
savingsPercent:40,
mutualFundPercent:40,
goldPercent:20
})

async function save(){

await api.post("/allocation/settings",settings)

alert("Settings updated")

}

return(

<div className="p-8">

<h1 className="text-2xl font-bold mb-6">
Allocation Settings
</h1>

<div className="space-y-4 max-w-md">

<input
type="number"
value={settings.savingsPercent}
onChange={e=>setSettings({...settings,savingsPercent:Number(e.target.value)})}
className="border p-2 w-full rounded"
/>

<input
type="number"
value={settings.mutualFundPercent}
onChange={e=>setSettings({...settings,mutualFundPercent:Number(e.target.value)})}
className="border p-2 w-full rounded"
/>

<input
type="number"
value={settings.goldPercent}
onChange={e=>setSettings({...settings,goldPercent:Number(e.target.value)})}
className="border p-2 w-full rounded"
/>

<button
onClick={save}
className="bg-indigo-600 text-white px-6 py-2 rounded"
>
Save Settings
</button>

</div>

</div>

)
}