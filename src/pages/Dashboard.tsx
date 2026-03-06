import { useEffect, useState } from "react"
import api from "../api/client"

import { motion } from "framer-motion"

import AppLayout from "../components/layout/AppLayout"
import StatCard from "../components/ui/StatCard"
import PortfolioChart from "../components/charts/PortfolioChart"
import AllocationPreview from "../components/ui/AllocationPreview"
import ChartCard from "../components/ui/ChartCard"

type DashboardData = {
  totalPayments:number
  totalSavings:number
  mfUnits:number
  goldGrams:number
  roundup:number
}

export default function Dashboard(){

  const [data,setData] = useState<DashboardData | null>(null)

  useEffect(()=>{

    api.get("/dashboard")
      .then(res=>{
        setData(res.data.data)
      })
      .catch(err=>{
        console.error(err)
      })

  },[])

  if(!data){

    return(

      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </AppLayout>

    )

  }

  return(

    <AppLayout>

      {/* Top Stats Animated */}

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.5}}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >

        <StatCard
          title="Total Payments"
          value={`₹${data.totalPayments}`}
        />

        <StatCard
          title="Total Savings"
          value={`₹${data.totalSavings}`}
        />

        <StatCard
          title="MF Units"
          value={data.mfUnits}
        />

      </motion.div>


      {/* Charts Section */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <PortfolioChart/>

        <ChartCard
          portfolio={{
            savingsBalance:data.totalSavings,
            mfUnits:data.mfUnits,
            goldGrams:data.goldGrams
          }}
        />

      </div>


      {/* Allocation Preview */}

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-lg font-semibold mb-2">
          Round-Up Allocation Preview
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Shows how your latest round-up amount is invested.
        </p>

        <AllocationPreview roundup={data.roundup}/>

      </div>

    </AppLayout>

  )

}