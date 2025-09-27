import React, { useState } from "react";
import UploadItinerary from "./components/UploadItinerary";
import ItineraryList from "./components/ItineraryList";

export default function App() {
  const [itineraries, setItineraries] = useState([]);

  const handleItinerariesUpdate = (newItinerary) => {
    setItineraries((prev) => [...prev, newItinerary]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Travel Itinerary Planner
      </h1>

      {/* Upload Section */}
      <div className="mb-6">
        <UploadItinerary onItinerariesUpdate={handleItinerariesUpdate} />
      </div>

      {/* List View */}
      <ItineraryList itineraries={itineraries} />
    </div>
  );
}
