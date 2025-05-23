import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Period = "year" | "quarter" | "month";

// Mock data for the chart
// In a real app, this would come from the API
const generateData = (period: Period) => {
  if (period === "year") {
    return [
      { name: "Jan", revenue: 25000 },
      { name: "Feb", revenue: 35000 },
      { name: "Mar", revenue: 28000 },
      { name: "Apr", revenue: 32000 },
      { name: "May", revenue: 42000 },
      { name: "Jun", revenue: 36000 },
      { name: "Jul", revenue: 30000 },
      { name: "Aug", revenue: 0 },
      { name: "Sep", revenue: 0 },
      { name: "Oct", revenue: 0 },
      { name: "Nov", revenue: 0 },
      { name: "Dec", revenue: 0 },
    ];
  } else if (period === "quarter") {
    return [
      { name: "Week 1", revenue: 9000 },
      { name: "Week 2", revenue: 11000 },
      { name: "Week 3", revenue: 8000 },
      { name: "Week 4", revenue: 8000 },
      { name: "Week 5", revenue: 10000 },
      { name: "Week 6", revenue: 7000 },
      { name: "Week 7", revenue: 9000 },
      { name: "Week 8", revenue: 11000 },
      { name: "Week 9", revenue: 12000 },
      { name: "Week 10", revenue: 10000 },
      { name: "Week 11", revenue: 9000 },
      { name: "Week 12", revenue: 14000 },
    ];
  } else {
    return [
      { name: "1", revenue: 2000 },
      { name: "5", revenue: 3000 },
      { name: "10", revenue: 1500 },
      { name: "15", revenue: 5000 },
      { name: "20", revenue: 4000 },
      { name: "25", revenue: 6000 },
      { name: "30", revenue: 5500 },
    ];
  }
};

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>("year");
  const data = generateData(period);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="pt-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Monthly Revenue</h3>
          <div className="flex space-x-2">
            <Button
              variant={period === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("year")}
              className={period === "year" ? "bg-primary text-white" : ""}
            >
              Year
            </Button>
            <Button
              variant={period === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("quarter")}
              className={period === "quarter" ? "bg-primary text-white" : ""}
            >
              Quarter
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("month")}
              className={period === "month" ? "bg-primary text-white" : ""}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="aspect-[16/9] bg-gray-50 rounded-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                contentStyle={{ 
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
