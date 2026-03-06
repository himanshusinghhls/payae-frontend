import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AllocationChart({ portfolio }: any) {
  const savings = portfolio?.savingsBalance || 0;
  const mf = portfolio?.mfUnits || 0; 
  const gold = portfolio?.goldGrams || 0; 

  const hasData = savings > 0 || mf > 0 || gold > 0;

  const data = {
    labels: ["Liquid Savings", "Mutual Funds", "Digital Gold"],
    datasets: [
      {
        data: hasData ? [savings, mf, gold] : [1],
        backgroundColor: hasData 
          ? ["#00E5FF", "#00FF94", "#f58220"]
          : ["rgba(255,255,255,0.05)"],
        borderColor: "#0A0F1C",
        borderWidth: 4,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "78%", 
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#9ca3af",
          usePointStyle: true,
          padding: 20,
          font: { family: "Inter", size: 12 },
        },
      },
      tooltip: {
        enabled: hasData,
        backgroundColor: "rgba(10, 15, 28, 0.9)",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  return (
    <div className="h-full w-full min-h-[300px] flex flex-col relative">
      <div className="flex-grow relative flex justify-center items-center">
        <Doughnut data={data} options={options} />
        
        {/* Dynamic Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
            Status
          </span>
          <span className="text-xl font-black text-white">
            {hasData ? "Active" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}