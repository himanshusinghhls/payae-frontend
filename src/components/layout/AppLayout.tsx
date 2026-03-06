import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout({children}:{children:any}){

  return(

    <div className="flex h-screen bg-gray-50">

      <Sidebar/>

      <div className="flex-1 flex flex-col">

        <Topbar/>

        <main className="p-6 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>

  )

}