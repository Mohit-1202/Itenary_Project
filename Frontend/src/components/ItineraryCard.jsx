/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { FaStar, FaMoneyBillWave, FaClock } from "react-icons/fa";

export default function ItineraryCard({ itinerary, highlight }) {
  const [showFullActivities, setShowFullActivities] = useState(false);

  const displayActivities = Array.isArray(itinerary.activities) ? itinerary.activities : [];

  const formatCurrency = (value) => {
    const n = typeof value === "number" ? value : parseInt(String(value).replace(/[₹,]/g, ""), 10);
    return n && !isNaN(n) ? `₹${n.toLocaleString("en-IN")}` : "₹0";
  };

  const toggleActivities = () => setShowFullActivities((prev) => !prev);

  const activitiesString = displayActivities.join(", ");
  const previewActivities = activitiesString.length > 200 ? activitiesString.slice(0, 200) + "..." : activitiesString;

  return (
    <div className={`relative bg-gradient-to-br from-white to-gray-100 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm mx-auto transform transition duration-300 hover:scale-102 hover:shadow-xl
      ${highlight ? "border-2 border-green-400" : "border border-gray-200"}`}>

      {highlight && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            <FaStar className="mr-1 text-xs" /> Best
          </span>
        </div>
      )}

      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-800 truncate">
        {itinerary.name || "Unnamed Trip"}
      </h3>

      {typeof itinerary.score === "number" && (
        <div className="mt-2 sm:mt-3">
          <div className="flex justify-between text-xs sm:text-sm text-yellow-700 font-medium">
            <span>Score</span>
            <span>{itinerary.score}/100</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-1.5 sm:h-2 mt-1 overflow-hidden">
            <div
              className="bg-yellow-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, itinerary.score))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 sm:mt-4 flex justify-between gap-2 sm:gap-3 text-gray-700">
        <div className="flex items-center gap-1 bg-white shadow-sm sm:shadow-md rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
          <FaMoneyBillWave className="text-green-600 text-xs sm:text-sm" /> 
          <span className="truncate">{formatCurrency(itinerary.totalCost)}</span>
        </div>
        <div className="flex items-center gap-1 bg-white shadow-sm sm:shadow-md rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium">
          <FaClock className="text-blue-600 text-xs sm:text-sm" /> 
          <span className="truncate">{itinerary.totalDuration || "Unknown"}</span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md bg-gradient-to-r from-blue-50 via-white to-purple-50 text-gray-800 text-xs sm:text-sm font-medium relative">
        <div className="absolute -top-2 left-3 sm:-top-3 sm:left-4 bg-white rounded-full px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
          <FaStar className="text-yellow-500 text-xs" /> Summary
        </div>
        <p className="mt-2 sm:mt-3 leading-relaxed text-xs sm:text-sm">
          {itinerary.tripSummary && itinerary.tripSummary.length > 150
            ? itinerary.tripSummary.slice(0, 150) + "..."
            : itinerary.tripSummary || "No summary available"}
        </p>
      </div>

      {displayActivities.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Top Activities</h4>
          <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm leading-relaxed space-y-1">
            {(showFullActivities ? displayActivities : displayActivities.slice(0, 3)).map((a, i) => (
              <li key={i} className="truncate">{a}</li>
            ))}
          </ul>
          {displayActivities.length > 3 && (
            <button
              onClick={toggleActivities}
              className="mt-1 sm:mt-2 text-blue-600 text-xs sm:text-sm font-semibold hover:text-blue-800 hover:underline transition"
            >
              {showFullActivities ? "Show Less" : `Show ${displayActivities.length - 3} More`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}