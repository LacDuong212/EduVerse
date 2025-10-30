import React from "react";

const OverviewCard = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCard;
