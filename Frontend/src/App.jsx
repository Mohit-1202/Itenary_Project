/* App.jsx */
import React, { useState } from "react";
import UploadItinerary from "./components/UploadItinerary";
import ItineraryList from "./components/ItineraryList";
import ComparisonView from "./components/ComparisonView";
import Navbar from "./components/Navbar";

// ---------- Score Utilities ----------
export const calculateMetrics = (itinerary) => {
  let totalCost = typeof itinerary.totalCost === "string"
    ? parseInt(itinerary.totalCost.replace(/[₹,]/g, ""), 10) || 0
    : itinerary.totalCost || 0;

  let totalDuration = 0;
  if (typeof itinerary.totalDuration === "string") {
    const daysMatch = itinerary.totalDuration.match(/(\d+)\s*Days?/i);
    if (daysMatch) totalDuration = parseInt(daysMatch[1], 10);
  }

  const totalActivities = Array.isArray(itinerary.activities)
    ? itinerary.activities.length
    : 0;

  return { totalCost, totalDuration, totalActivities };
};

export const calculateScore = (itinerary, allItineraries) => {
  const { totalCost, totalDuration, totalActivities } = calculateMetrics(itinerary);

  const minCost = Math.min(...allItineraries.map(t => calculateMetrics(t).totalCost));
  const maxCost = Math.max(...allItineraries.map(t => calculateMetrics(t).totalCost));
  const minDuration = Math.min(...allItineraries.map(t => calculateMetrics(t).totalDuration));
  const maxDuration = Math.max(...allItineraries.map(t => calculateMetrics(t).totalDuration));
  const minActivities = Math.min(...allItineraries.map(t => calculateMetrics(t).totalActivities));
  const maxActivities = Math.max(...allItineraries.map(t => calculateMetrics(t).totalActivities));

  const costScore = 1 - (totalCost - minCost) / ((maxCost - minCost) || 1);
  const durationScore = 1 - (totalDuration - minDuration) / ((maxDuration - minDuration) || 1);
  const activitiesScore = (totalActivities - minActivities) / ((maxActivities - minActivities) || 1);

  return Math.round((costScore * 0.4 + durationScore * 0.3 + activitiesScore * 0.3) * 100);
};

export default function App() {
  const [itineraries, setItineraries] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [appError, setAppError] = useState("");

  const scoredItineraries = itineraries.map(itinerary => ({
    ...itinerary,
    score: calculateScore(itinerary, itineraries)
  }));
  const bestScore = Math.max(...scoredItineraries.map(t => t.score || 0));

  const handleItinerariesUpload = (data) => {
    try {
      const formattedData = Array.isArray(data) ? data : [data];
      const validatedData = formattedData.map((itinerary, index) => ({
        name: itinerary.name || itinerary.tripName || `Trip ${index + 1}`,
        totalCost: Number(itinerary.totalCost) || 0,
        totalDuration: itinerary.totalDuration || "Unknown",
        activities: Array.isArray(itinerary.activities) ? itinerary.activities : [],
        perPersonCost: itinerary.perPersonCost ? Number(itinerary.perPersonCost) : null,
        tripName: itinerary.tripName || itinerary.name || `Trip ${index + 1}`,
      }));
      setItineraries(validatedData);
      setAppError("");
    } catch (error) {
      setAppError("Error processing itineraries: " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">

        {appError && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg shadow">{appError}</div>
        )}

        {/* Upload Section */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl ">
            <UploadItinerary onItinerariesUpload={handleItinerariesUpload} />
          </div>
        </div>

        {/* Instructions */}
        {itineraries.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 shadow-inner">
            <h3 className="font-bold text-yellow-800 mb-2 text-lg">How to use this app:</h3>
            <ul className="text-yellow-700 list-disc list-inside space-y-1 text-sm">
              <li>Upload PDFs - extracts trip names from file names</li>
              <li>Use JSON upload for full data control</li>
              <li>Click "Load Andaman Sample Data" for demo</li>
            </ul>
          </div>
        )}

        {/* View Toggle */}
        {itineraries.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-2">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-md font-semibold ${viewMode === "cards" ? "bg-blue-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-md font-semibold ${viewMode === "table" ? "bg-blue-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Table View
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {itineraries.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-3xl shadow-2xl p-6">
            <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Itinerary Comparison Results</h2>
            {viewMode === "cards"
              ? <ItineraryList itineraries={scoredItineraries} />
              : <ComparisonView itineraries={scoredItineraries} bestScore={bestScore} />}
          </div>
        )}

      </div>
    </div>
  );
}
