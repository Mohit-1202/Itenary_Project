/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
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
        ...itinerary,
        name: itinerary.name || itinerary.tripName || `Trip ${index + 1}`,
        totalCost: Number(itinerary.totalCost) || 0,
        totalDuration: itinerary.totalDuration || "Unknown",
        activities: Array.isArray(itinerary.activities) ? itinerary.activities : [],
        perPersonCost: itinerary.perPersonCost ? Number(itinerary.perPersonCost) : null,
        tripName: itinerary.tripName || itinerary.name || `Trip ${index + 1}`,
        tripSummary: itinerary.tripSummary || generateTripSummary(itinerary)
      }));
      setItineraries(validatedData);
      setAppError("");
    } catch (error) {
      setAppError("Error processing itineraries: " + error.message);
    }
  };

  const generateTripSummary = (itinerary) => {
    const cost = itinerary.totalCost || 0;
    const duration = itinerary.totalDuration || "Unknown";
    const activities = Array.isArray(itinerary.activities) ? itinerary.activities : [];

    const topActivities = activities.slice(0, 3).map(a => a.length > 50 ? a.slice(0, 47) + "..." : a);

    const openingTemplates = [
      () => duration !== "Unknown" ? `Spend ${duration.toLowerCase()} exploring this amazing trip.` : "Embark on an unforgettable journey.",
      () => duration !== "Unknown" ? `A ${duration.toLowerCase()} adventure awaits you.` : "Discover the wonders of this trip.",
      () => duration !== "Unknown" ? `This trip offers ${duration.toLowerCase()} full of excitement and relaxation.` : "Experience a memorable trip filled with highlights.",
    ];

    const opening = openingTemplates[Math.floor(Math.random() * openingTemplates.length)]();
    const costSentence = cost > 0 ? `Estimated cost: ₹${cost.toLocaleString("en-IN")}.` : "";
    const activitiesSentence = topActivities.length > 0 ? `Key highlights include ${topActivities.join(", ")}.` : "";

    const fillerPhrases = [
      "Perfect for adventure seekers and leisure travelers alike.",
      "A mix of relaxation and sightseeing awaits.",
      "Discover culture, cuisine, and breathtaking views.",
    ];
    const filler = fillerPhrases[Math.floor(Math.random() * fillerPhrases.length)];

    const sentences = [opening, costSentence, activitiesSentence, filler].filter(Boolean);
    return sentences.join(" ");
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">

        {appError && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg shadow text-sm sm:text-base">
            {appError}
          </div>
        )}

        {/* Upload Section */}
        <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
          <div className="w-full max-w-2xl">
            <UploadItinerary onItinerariesUpload={handleItinerariesUpload} />
          </div>
        </div>

        {/* Instructions */}
        {itineraries.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 shadow-inner">
            <h3 className="font-bold text-yellow-800 mb-2 text-base sm:text-lg">How to use this app:</h3>
            <ul className="text-yellow-700 list-disc list-inside space-y-1 text-xs sm:text-sm">
              <li>Upload PDFs - extracts trip names from file names</li>
              <li>Use JSON upload for full data control</li>
              <li>Click "Load Andaman Sample Data" for demo</li>
            </ul>
          </div>
        )}

        {/* View Toggle */}
        {itineraries.length > 0 && (
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-md font-semibold text-xs sm:text-sm ${viewMode === "cards" ? "bg-blue-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 sm:px-4 py-1 sm:py-2 rounded-md font-semibold text-xs sm:text-sm ${viewMode === "table" ? "bg-blue-500 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}
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