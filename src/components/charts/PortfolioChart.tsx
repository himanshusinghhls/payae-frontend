import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip);

export default function PortfolioChart() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: [2000, 2500, 3200, 4100, 4700, 5500],
        borderColor: "#00E5FF",
        backgroundColor: "rgba(0, 229, 255, 0.1)", 
        borderWidth: 3,
        tension: 0.4, 
        fill: true, 
        pointBackgroundColor: "#0A0F1C",
        pointBorderColor: "#00E5FF",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10, 15, 28, 0.9)",
        titleColor: "#9ca3af",
        bodyColor: "#ffffff",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `₹${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false }, 
        ticks: { color: "#9ca3af", font: { family: "Inter" } },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)", drawBorder: false }, 
        ticks: { 
          color: "#9ca3af", 
          font: { family: "Inter" },
          callback: (value: any) => `₹${value}`
        },
      },
    },
  };

  return (
    <div className="h-full w-full min-h-[300px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Wealth Trajectory</h3>
        <span className="bg-payae-success/10 text-payae-success px-3 py-1 rounded-full text-xs font-bold tracking-wider">
          +175% YTD
        </span>
      </div>
      <div className="flex-grow">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}