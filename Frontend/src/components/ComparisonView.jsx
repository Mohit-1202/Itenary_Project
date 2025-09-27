import { calculateMetrics, calculateScore, generateRationale } from "../utils/calculateMetrics.jsx";

export default function ComparisonView({ itineraries }) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Comparison Results</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">Trip Name</th>
              <th className="py-2 px-4 border">Total Cost (₹)</th>
              <th className="py-2 px-4 border">Total Duration (hrs)</th>
              <th className="py-2 px-4 border"># Activities</th>
              <th className="py-2 px-4 border">Score (0-100)</th>
              <th className="py-2 px-4 border">Rationale</th>
            </tr>
          </thead>

          <tbody>
            {itineraries.map((trip, index) => {
              const { totalCost, totalDuration, totalActivities } =
                calculateMetrics(trip);
              const score = calculateScore(trip, itineraries);
              const rationale = generateRationale(trip, itineraries);

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border font-semibold">
                    {trip.tripName || "Unnamed Trip"}
                  </td>
                  <td className="py-2 px-4 border">₹{totalCost}</td>
                  <td className="py-2 px-4 border">{totalDuration} hrs</td>
                  <td className="py-2 px-4 border">{totalActivities}</td>
                  <td className="py-2 px-4 border font-bold text-blue-600">
                    {score}
                  </td>
                  <td className="py-2 px-4 border text-gray-700">
                    {rationale}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}