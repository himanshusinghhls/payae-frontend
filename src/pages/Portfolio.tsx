import { useEffect,useState } from "react"
import AppLayout from "../components/layout/AppLayout"
import api from "../api/client"
import AllocationChart from "../components/charts/AllocationChart"

export default function Portfolio(){

  const [portfolio,setPortfolio] = useState<any>(null)

  useEffect(()=>{

    api.get("/portfolio")
    .then(res=>setPortfolio(res.data))

  },[])

  if(!portfolio) return <div>Loading...</div>

  return(

    <AppLayout>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="font-semibold mb-4">
            Portfolio Value
          </h2>

          <p>Savings ₹{portfolio.savingsBalance}</p>
          <p>MF Units {portfolio.mfUnits}</p>
          <p>Gold Grams {portfolio.goldGrams}</p>

        </div>

        <AllocationChart portfolio={portfolio}/>

      </div>

    </AppLayout>

  )

}