import React from "react";
import ItineraryCard from "./ItineraryCard";
import { calculateScore } from "../App";

export default function ItineraryList({ itineraries }) {
  if (!itineraries || itineraries.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-6 text-lg font-medium">
        No itineraries uploaded yet.
      </p>
    );
  }

  // Calculate scores
  const scored = itineraries.map(it => ({
    ...it,
    score: calculateScore(it, itineraries),
  }));

  const bestScore = Math.max(...scored.map(s => s.score || 0));

  return (
    <div className="mt-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {scored.map((it, idx) => (
          <div
            key={idx}
            className="transform transition duration-500 hover:scale-105 hover:shadow-3xl animate-fadeIn"
            style={{
              animationDelay: `${idx * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <ItineraryCard itinerary={it} highlight={it.score === bestScore} />
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
      `}</style>
    </div>
  );
}
