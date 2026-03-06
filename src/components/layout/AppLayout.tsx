import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout({children}:{children:any}){

  return(

    <div className="flex bg-gray-50 min-h-screen">

      <Sidebar/>

      <div className="flex-1">

        <Topbar/>

        <div className="p-8">

          {children}

        </div>

      </div>

    </div>

  )

}