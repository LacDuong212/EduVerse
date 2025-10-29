import React, { useState, useEffect } from "react";
import OverviewCard from "./OverviewCard";
import CustomBarChart from "./CustomBarChart.jsx";
import axios from "axios";

const filterOptions = ["6_months", "this_year", "last_year"];

const Overview = () => {
  const [filter, setFilter] = useState("6_months");
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [earningData, setEarningData] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch enrollment stats ---
  const fetchEnrollmentStats = async (range) => {
    try {
      const res = await axios.get(`/instructor/stats/enrollments?range=${range}`);
      if (res.data.success) setEnrollmentData(res.data.data);
    } catch (err) {
      console.error("Fetch enrollment stats error:", err);
    }
  };

  // --- Fetch earning stats ---
  const fetchEarningStats = async (range) => {
    try {
      const res = await axios.get(`/instructor/stats/earnings?range=${range}`);
      if (res.data.success) setEarningData(res.data.data);
    } catch (err) {
      console.error("Fetch earning stats error:", err);
    }
  };

  // --- Whenever filter changes, refetch data ---
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEnrollmentStats(filter), fetchEarningStats(filter)])
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      {/* --- Overview cards --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <OverviewCard title="Total Courses" value="12" />
        <OverviewCard title="Total Students" value="1,245" />
        <OverviewCard title="New Students" value="45" />
        <OverviewCard title="Avg Rating" value="4.7 ★" />
      </section>

      {/* --- Filter options --- */}
      <div className="mb-4 flex gap-2">
        {filterOptions.map((option) => (
          <button
            key={option}
            className={`px-3 py-1 rounded ${
              filter === option ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setFilter(option)}
          >
            {option.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Enrollment */}
        <CustomBarChart
          title="Enrollment Growth"
          data={enrollmentData}
          bars={[{ dataKey: "enrollments", fill: "#3b82f6" }]}
        />

        {/* Chart Earnings & Paid */}
        <CustomBarChart
          title="Earnings & Paid"
          data={earningData}
          bars={[
            { dataKey: "earning", fill: "#3b82f6" },
            { dataKey: "paid", fill: "#10b981" },
          ]}
        />
      </div>

      {loading && <p className="mt-4 text-gray-500">Loading data...</p>}
    </div>
  );
};

export default Overview;
