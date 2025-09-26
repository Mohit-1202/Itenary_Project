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
  const previewActivities = activitiesString.length > 300 ? activitiesString.slice(0, 300) + "..." : activitiesString;

  return (
    <div className={`relative bg-gradient-to-br from-white to-gray-100 rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-auto transform transition duration-500 hover:scale-105 hover:shadow-3xl
      ${highlight ? "border-2 border-green-400" : "border border-gray-200"}`}>

      {/* Best Option badge */}
      {highlight && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            <FaStar className="mr-1" /> Best Option
          </span>
        </div>
      )}

      {/* Trip Name */}
      <h3 className="text-2xl font-extrabold text-gray-800 truncate relative ">
        {itinerary.name || "Unnamed Trip"}
      </h3>

      {/* Score */}
      {typeof itinerary.score === "number" && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-yellow-700 font-medium">
            <span>Score</span>
            <span>{itinerary.score}/100</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, itinerary.score))}%` }}
            />
          </div>
        </div>
      )}

      {/* Costs & Duration */}
      <div className="mt-4 flex justify-between gap-3 text-gray-700">
        <div className="flex items-center gap-1 bg-white shadow-md rounded-xl px-3 py-1 text-sm font-medium">
          <FaMoneyBillWave className="text-green-600" /> {formatCurrency(itinerary.totalCost)}
        </div>
        <div className="flex items-center gap-1 bg-white shadow-md rounded-xl px-3 py-1 text-sm font-medium">
          <FaClock className="text-blue-600" /> {itinerary.totalDuration || "Unknown"}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 rounded-xl shadow-md bg-gradient-to-r from-blue-50 via-white to-purple-50 text-gray-800 text-sm font-medium relative">
        <div className="absolute -top-3 left-4 bg-white rounded-full px-2 py-1 text-xs font-semibold shadow-sm flex items-center gap-1">
          <FaStar className="text-yellow-500" /> Summary
        </div>
        <p className="mt-2 leading-relaxed">
          {itinerary.tripSummary
            ? itinerary.tripSummary.length > 250
              ? itinerary.tripSummary.slice(0, 250) + "..."
              : itinerary.tripSummary
            : "Sorry, no summary available for this trip."}
        </p>
      </div>


      {/* Top Activities */}
      {displayActivities.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Activities</h4>
          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed">
            {(showFullActivities ? displayActivities : displayActivities.join(" ").slice(0, 300).split(",")).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          {activitiesString.length > 300 && (
            <button
              onClick={toggleActivities}
              className="mt-2 text-blue-600 text-sm font-semibold hover:text-blue-800 hover:underline transition"
            >
              {showFullActivities ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
