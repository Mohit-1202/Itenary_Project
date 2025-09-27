export const parseCost = (cost) => {
  if (cost === undefined || cost === null) return 0;
  if (typeof cost === "number") return cost;
  const s = String(cost).replace(/[₹,\s]/g, "");
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

// Calculate metrics for an itinerary
export const calculateMetrics = (itinerary) => {
  const totalCost = parseCost(itinerary.totalCost);

  // Extract duration in days
  let totalDuration = 0;
  if (typeof itinerary.totalDuration === "string") {
    const daysMatch = itinerary.totalDuration.match(/(\d{1,2})\s*Days?/i);
    if (daysMatch) totalDuration = parseInt(daysMatch[1], 10);
    else {
      const nightsDays = itinerary.totalDuration.match(/(\d{1,2})\s*Nights?\s*\/\s*(\d{1,2})\s*Days?/i);
      if (nightsDays) totalDuration = parseInt(nightsDays[2], 10);
    }
  } else if (typeof itinerary.totalDuration === "number") {
    totalDuration = itinerary.totalDuration;
  }

  const totalActivities = Array.isArray(itinerary.activities) ? itinerary.activities.length : 0;

  return { totalCost, totalDuration, totalActivities };
};

// Generate score for an itinerary (0-100)
export const calculateScore = (itinerary, allItineraries) => {
  if (!Array.isArray(allItineraries) || allItineraries.length === 0) return 0;

  const { totalCost, totalDuration, totalActivities } = calculateMetrics(itinerary);

  const metrics = allItineraries.map(t => calculateMetrics(t));

  const minCost = Math.min(...metrics.map(m => m.totalCost));
  const maxCost = Math.max(...metrics.map(m => m.totalCost));
  const minDuration = Math.min(...metrics.map(m => m.totalDuration));
  const maxDuration = Math.max(...metrics.map(m => m.totalDuration));
  const minActivities = Math.min(...metrics.map(m => m.totalActivities));
  const maxActivities = Math.max(...metrics.map(m => m.totalActivities));

  const costScore = maxCost === minCost ? 1 : 1 - (totalCost - minCost) / (maxCost - minCost);
  // For duration shorter is better: shorter -> score closer to 1
  const durationScore = maxDuration === minDuration ? 1 : 1 - (totalDuration - minDuration) / (maxDuration - minDuration);
  const activitiesScore = maxActivities === minActivities ? 1 : (totalActivities - minActivities) / (maxActivities - minActivities);

  // weight: cost 0.45, duration 0.25, activities 0.30 (adjustable)
  const finalScore = (Math.max(0, costScore) * 0.45 + Math.max(0, durationScore) * 0.25 + Math.max(0, activitiesScore) * 0.30) * 100;

  return Math.round(finalScore);
};

// Generate a short rationale/explanation
export const generateRationale = (itinerary, allItineraries) => {
  if (!Array.isArray(allItineraries) || allItineraries.length === 0) return "Balanced option";

  const { totalCost, totalActivities } = calculateMetrics(itinerary);

  const lowestCostTrip = allItineraries.reduce((prev, curr) =>
    calculateMetrics(prev).totalCost < calculateMetrics(curr).totalCost ? prev : curr
  );

  const highestActivitiesTrip = allItineraries.reduce((prev, curr) =>
    calculateMetrics(prev).totalActivities > calculateMetrics(curr).totalActivities ? prev : curr
  );

  const reasons = [];
  if (itinerary === lowestCostTrip) reasons.push("Lowest total cost");
  if (itinerary === highestActivitiesTrip) reasons.push("Most activities included");
  if (!reasons.length) reasons.push("Balanced option");

  return reasons.join(", ");
};