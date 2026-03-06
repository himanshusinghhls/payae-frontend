import { useState } from "react"
import AppLayout from "../components/layout/AppLayout"
import api from "../api/client"
import { motion } from "framer-motion"
import AllocationPreview from "../components/ui/AllocationPreview"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Payment(){

  const [amount,setAmount] = useState<number>(0)
  const [roundup,setRoundup] = useState<number>(0)

  const calculateRoundup = (value:number)=>{

    setAmount(value)

    const next = Math.ceil(value/10)*10

    setRoundup(next - value)

  }

  const pay = async()=>{

    const order = await api.post("/payments/create-order",{amount})

    const options = {

      key: import.meta.env.VITE_RAZORPAY_KEY,

      amount: order.data.amount,

      currency:"INR",

      name:"PayAE",

      description:"Fintech Simulation Payment",

      order_id: order.data.id,

      handler: async function(response:any){

        await api.post("/payments/verify",{

          orderId:response.razorpay_order_id,
          paymentId:response.razorpay_payment_id,
          signature:response.razorpay_signature,
          amount:amount

        })

        alert("Payment Successful 🎉")

      }

    }

    const rzp = new window.Razorpay(options)

    rzp.open()

  }

  return(

    <AppLayout>

      <div className="max-w-xl mx-auto">

        <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4">
            Make Payment
          </h2>

          <input
          type="number"
          placeholder="Enter amount"
          className="w-full border p-3 rounded mb-4"
          onChange={(e)=>calculateRoundup(Number(e.target.value))}
          />

          <div className="bg-gray-50 p-4 rounded mb-4">

            <p className="text-sm text-gray-500">
              Round-up Amount
            </p>

            <h3 className="text-xl font-bold text-indigo-600">
              ₹{roundup}
            </h3>

          </div>

          <button
          onClick={pay}
          className="w-full bg-indigo-600 text-white p-3 rounded">

            Pay ₹{amount}

          </button>

        </motion.div>

      </div>

    </AppLayout>

  )

}