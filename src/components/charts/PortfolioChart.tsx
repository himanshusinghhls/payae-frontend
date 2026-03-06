import { Line } from "react-chartjs-2"
import {
Chart as ChartJS,
LineElement,
CategoryScale,
LinearScale,
PointElement
} from "chart.js"

ChartJS.register(
LineElement,
CategoryScale,
LinearScale,
PointElement
)

export default function PortfolioChart(){

  const data = {
    labels:["Jan","Feb","Mar","Apr","May","Jun"],

    datasets:[
      {
        label:"Portfolio Value",

        data:[2000,2500,3200,4100,4700,5500],

        borderColor:"#6366f1",

        tension:0.4
      }
    ]
  }

  return(

    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="font-semibold mb-4">
        Portfolio Growth
      </h3>

      <Line data={data}/>

    </div>

  )

}