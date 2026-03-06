import { useEffect,useState } from "react"
import api from "../api/client"
import AppLayout from "../components/layout/AppLayout"

export default function Ledger(){

  const [data,setData] = useState<any[]>([])

  useEffect(()=>{

    api.get("/ledger")
    .then(res=>setData(res.data))

  },[])

  return(

    <AppLayout>

      <div className="bg-white p-6 rounded shadow">

        <h2 className="font-semibold mb-4">
          Transactions
        </h2>

        <table className="w-full">

          <thead>

            <tr className="text-left border-b">

              <th>Type</th>
              <th>Amount</th>
              <th>Asset</th>
              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {data.map((t,i)=>(

              <tr key={i} className="border-b">

                <td>{t.type}</td>
                <td>₹{t.amount}</td>
                <td>{t.assetType}</td>
                <td>{t.timestamp}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </AppLayout>

  )

}