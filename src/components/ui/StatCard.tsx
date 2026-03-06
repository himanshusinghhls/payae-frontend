import { motion } from "framer-motion"

export default function StatCard({title,value}:{title:string,value:any}){

  return(

    <motion.div
      whileHover={{scale:1.03}}
      className="bg-white p-6 rounded-xl shadow"
    >

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="text-2xl font-bold mt-2">
        {value}
      </h2>

    </motion.div>

  )

}