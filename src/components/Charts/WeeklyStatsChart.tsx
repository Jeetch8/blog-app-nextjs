import { BarChart } from "@mui/x-charts/BarChart";
import { Objtemp } from "../pages/UserStats";

export default function SimpleBarChart({
  weeklyData,
}: {
  weeklyData: Objtemp;
}) {
  return (
    <BarChart
      width={1400}
      height={300}
      series={[{ data: weeklyData.yAxis, label: "pv", id: "pvId" }]}
      xAxis={[{ data: weeklyData.xAxis, scaleType: "band" }]}
    />
  );
}
