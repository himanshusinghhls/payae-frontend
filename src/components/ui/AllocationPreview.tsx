export default function AllocationPreview({roundup}:{roundup:number}){

  const savings = roundup*0.4
  const mf = roundup*0.4
  const gold = roundup*0.2

  return(

    <div className="grid grid-cols-3 gap-3 mt-4">

      <div className="bg-green-50 p-3 rounded">

        <p className="text-xs text-gray-500">
          Savings
        </p>

        <p className="font-semibold">
          ₹{savings.toFixed(2)}
        </p>

      </div>

      <div className="bg-blue-50 p-3 rounded">

        <p className="text-xs text-gray-500">
          Mutual Fund
        </p>

        <p className="font-semibold">
          ₹{mf.toFixed(2)}
        </p>

      </div>

      <div className="bg-yellow-50 p-3 rounded">

        <p className="text-xs text-gray-500">
          Gold
        </p>

        <p className="font-semibold">
          ₹{gold.toFixed(2)}
        </p>

      </div>

    </div>

  )

}