import {Bell} from "lucide-react"

export default function Topbar(){

  return(

    <div className="h-16 bg-white shadow flex items-center justify-between px-6">

      <h1 className="font-semibold text-lg">
        PayAE Dashboard
      </h1>

      <div className="flex items-center gap-4">

        <Bell/>

        <div className="w-8 h-8 rounded-full bg-indigo-500"/>

      </div>

    </div>

  )

}