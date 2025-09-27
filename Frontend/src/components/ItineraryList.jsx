import React from "react";
import ItineraryCard from "./ItineraryCard";

export default function ItineraryList({ itineraries }) {
  if (!itineraries || itineraries.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-4 sm:mt-6 text-base sm:text-lg font-medium">
        No itineraries uploaded yet.
      </p>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 md:mt-8 px-2 sm:px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {itineraries.map((it, idx) => (
          <div
            key={idx}
            className="transform transition duration-300 hover:scale-102 hover:shadow-xl animate-fadeIn"
            style={{
              animationDelay: `${idx * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <ItineraryCard itinerary={it} />
          </div>
        ))}
      </div>

      {/* Tailwind animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
