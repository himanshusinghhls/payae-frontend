import { PieChart, Pie, Cell, Tooltip } from "recharts"

export default function ChartCard({portfolio}:{portfolio:any}){

  const data = [
    {name:"Savings", value:portfolio.savingsBalance},
    {name:"Mutual Fund", value:portfolio.mfUnits*100},
    {name:"Gold", value:portfolio.goldGrams*5000}
  ]

  return(

    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-lg font-semibold mb-4">
        Portfolio Distribution
      </h2>

      <PieChart width={300} height={220}>

        <Pie
          data={data}
          dataKey="value"
          outerRadius={80}
        >

          {data.map((_,i)=>(
            <Cell key={i}/>
          ))}

        </Pie>

        <Tooltip/>

      </PieChart>

    </div>

  )

}