import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertOctagon,
} from "lucide-react";
import BiochemicalLineGraphModal from "./BiochemicalLineGraphModal"; // Ensure this import exists

const LatestBiometricsTable = ({ latestBiometrics, biometrics }) => {
  const [sortField, setSortField] = useState("category");
  const [sortDirection, setSortDirection] = useState("asc");
  const [lineGraphModalOpen, setLineGraphModalOpen] = useState(false);
  const [selectedBiochemical, setSelectedBiochemical] = useState(null);

  const currentDate = new Date();


  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      // For the condition column, default to descending so "High" comes first
      setSortDirection(field === "isHyper" ? "desc" : "asc");
    }
  };

  const sortedData = [...latestBiometrics].sort((a, b) => {
    if (sortField === "isHyper") {
      // Map isHyper to a rank: High (true)=3, Normal (null)=2, Low (false)=1
      const rank = (val) => (val === true ? 3 : val === null ? 2 : 1);
      const rankA = rank(a.isHyper);
      const rankB = rank(b.isHyper);
      return sortDirection === "asc" ? rankA - rankB : rankB - rankA;
    } else {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
  });

  const getTimeDiffText = (dateStr) => {
    const diff = new Date(dateStr) - currentDate;
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    if (days)
      return diff < 0
        ? `Expired ${days} day${days > 1 ? "s" : ""} ago`
        : `Expires in ${days} day${days > 1 ? "s" : ""}`;
    const hours = Math.floor(abs / 3600000);
    if (hours)
      return diff < 0
        ? `Expired ${hours} hour${hours > 1 ? "s" : ""} ago`
        : `Expires in ${hours} hour${hours > 1 ? "s" : ""}`;
    const minutes = Math.floor(abs / 60000);
    return diff < 0
      ? `Expired ${minutes} minute${minutes > 1 ? "s" : ""} ago`
      : `Expires in ${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const headers = [
    { field: "category", label: "Category" },
    { field: "name", label: "Name" },
    { field: "value", label: "Value" },
    { field: "isHyper", label: "Condition" },
  ];

  // When a row is clicked, use its category and name to retrieve the full object from `biometrics`
  const handleRowClick = (item) => {
    const { category, name } = item;
    const biochemicalData = biometrics?.[category]?.[name];
    // Attach name and category if needed
    setSelectedBiochemical(biochemicalData ? { ...biochemicalData, name, category } : item);
    setLineGraphModalOpen(true);
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-white  ">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-red-500" />
            <span className="text-xs text-gray-600">
              Value Above Range
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs text-gray-600">
              Value Below Range
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-xs text-gray-600">
              Within Normal Range
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider cursor-pointer "
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {sortField === field &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      ))}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                Range
              </th>
              <th
                onClick={() => handleSort("expiryDate")}
                className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center space-x-1">
                  <span>Expiry Status</span>
                  {sortField === "expiryDate" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map(
              (
                {
                  id,
                  category,
                  name,
                  value,
                  unit,
                  isHyper,
                  healthy_min,
                  healthy_max,
                  expiryDate,
                },
                index
              ) => (
                <tr
                  key={id || index}
                  onClick={() => handleRowClick({ category, name, value, unit, isHyper, healthy_min, healthy_max, expiryDate })}
                  className={`${
                    isHyper === null ? "bg-gray-100" : "bg-red-50"
                  } hover:bg-gray-50 transition-colors cursor-pointer`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900">{category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900">{name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      {value} {unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {isHyper === null ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : isHyper ? (
                        <TrendingUp className="text-red-500" size={18} />
                      ) : (
                        <TrendingDown className="text-red-500" size={18} />
                      )}
                      <span
                        className={`text-xs ${
                          isHyper === null ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {isHyper === null ? "Normal" : isHyper ? "High" : "Low"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 rounded-md text-xs ${
                          isHyper === false
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Min: {healthy_min}
                      </span>
                      <div className="w-20 h-2 bg-gray-200  overflow-hidden">
                        <div
                          className={`h-full ${
                            isHyper === null ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                ((value - healthy_min) /
                                  (healthy_max - healthy_min)) *
                                  100
                              )
                            )}%`,
                            maxWidth: "100%",
                          }}
                        />
                      </div>
                      <span
                        className={`px-2 py-1 rounded-md text-xs ${
                          isHyper === true
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        Max: {healthy_max}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {new Date(expiryDate) < currentDate ? (
                        <AlertOctagon size={18} className="text-orange-500" />
                      ) : (
                        <Clock size={18} className="text-blue-500" />
                      )}
                      <div className="flex flex-col">
                        <span
                          className={`text-xs ${
                            new Date(expiryDate) < currentDate
                              ? "text-orange-700"
                              : "text-blue-700"
                          }`}
                        >
                          {new Date(expiryDate) < currentDate ? "Expired" : "Valid"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeDiffText(expiryDate)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {lineGraphModalOpen && (
        <BiochemicalLineGraphModal
          isOpen={lineGraphModalOpen}
          onClose={() => setLineGraphModalOpen(false)}
          selectedBiochemical={selectedBiochemical}
        />
      )}
    </div>
  );
};

export default LatestBiometricsTable;
