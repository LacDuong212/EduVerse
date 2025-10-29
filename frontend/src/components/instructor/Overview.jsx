import React, { useState } from "react";
import OverviewCard from "./OverviewCard";
import CustomBarChart from "./CustomBarChart.jsx";

// Dữ liệu ví dụ
const allData = {
  "6_months": [
    { month: "Jan", enrollments: 30 },
    { month: "Feb", enrollments: 50 },
    { month: "Mar", enrollments: 80 },
    { month: "Apr", enrollments: 40 },
    { month: "May", enrollments: 90 },
    { month: "Jun", enrollments: 120 },
  ],
  "this_year": [
    { month: "Jan", enrollments: 30 },
    { month: "Feb", enrollments: 50 },
    { month: "Mar", enrollments: 80 },
    { month: "Apr", enrollments: 40 },
    { month: "May", enrollments: 90 },
    { month: "Jun", enrollments: 120 },
    { month: "Jul", enrollments: 60 },
    { month: "Aug", enrollments: 75 },
    { month: "Sep", enrollments: 95 },
    { month: "Oct", enrollments: 110 },
    { month: "Nov", enrollments: 130 },
    { month: "Dec", enrollments: 140 },
  ],
  "last_year": [
    { month: "Jan", enrollments: 20 },
    { month: "Feb", enrollments: 40 },
    { month: "Mar", enrollments: 70 },
    { month: "Apr", enrollments: 30 },
    { month: "May", enrollments: 80 },
    { month: "Jun", enrollments: 100 },
    { month: "Jul", enrollments: 50 },
    { month: "Aug", enrollments: 65 },
    { month: "Sep", enrollments: 85 },
    { month: "Oct", enrollments: 90 },
    { month: "Nov", enrollments: 110 },
    { month: "Dec", enrollments: 120 },
  ],
};

const Overview = () => {
  const [filter, setFilter] = useState("6_months");

  return (
    <div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <OverviewCard title="Total Courses" value="12" />
        <OverviewCard title="Total Students" value="1,245" />
        <OverviewCard title="New Students" value="45" />
        <OverviewCard title="Avg Rating" value="4.7 ★" />
      </section>

      {/* Filter options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart Enrollment */}
      <CustomBarChart
        title="Enrollment Growth"
        data={[
          { month: "Jan", enrollments: 30 },
          { month: "Feb", enrollments: 50 },
          { month: "Mar", enrollments: 80 },
          { month: "Apr", enrollments: 40 },
        ]}
        bars={[{ dataKey: "enrollments", fill: "#3b82f6" }]}
      />

      {/* Chart Earnings */}
      <CustomBarChart
        title="Earnings & Paid"
        data={[
          { month: "Jan", earning: 3000, paid: 2000 },
          { month: "Feb", earning: 5000, paid: 4000 },
          { month: "Mar", earning: 7000, paid: 5000 },
          { month: "Apr", earning: 4000, paid: 3500 },
        ]}
        bars={[
          { dataKey: "earning", fill: "#3b82f6" },
          { dataKey: "paid", fill: "#10b981" },
        ]}
      />
    </div>
    </div>
  );
};

export default Overview;
