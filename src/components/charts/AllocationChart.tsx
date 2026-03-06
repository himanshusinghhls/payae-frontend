import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS,ArcElement,Tooltip,Legend } from "chart.js"

ChartJS.register(ArcElement,Tooltip,Legend)

export default function AllocationChart({portfolio}:any){

  const data = {

    labels:["Savings","Mutual Fund","Gold"],

    datasets:[
      {
        data:[
          portfolio.savingsBalance,
          portfolio.mfUnits,
          portfolio.goldGrams
        ],

        backgroundColor:[
          "#22c55e",
          "#6366f1",
          "#f59e0b"
        ]
      }
    ]

  }

  return(

    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="mb-4 font-semibold">
        Portfolio Allocation
      </h3>

      <Doughnut data={data}/>

    </div>

  )

}