/* eslint-disable no-useless-escape */
import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function UploadItinerary({ onItinerariesUpload }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [debugInfo, setDebugInfo] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const collapseDigitSpaces = (str) => {
    let prev;
    do {
      prev = str;
      str = str.replace(/(\d)\s+(\d)/g, "$1$2");
    } while (str !== prev);
    return str;
  };

  const capitalizeAfterPeriod = (text) => {
    return text.replace(/([.?!]\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
  };

  const formatActivities = (activities) => {
    if (!Array.isArray(activities)) return [];
    return activities.map((act) => capitalizeAfterPeriod(act.trim()));
  };

  const parsePDF = async (file) => {
    const typedArray = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let allText = "";
    const worker = await createWorker();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const directText = textContent.items
        .map((item) => item.str.replace(/(\d)(?=\d)/g, "$1"))
        .join(" ")
        .replace(/(\d)\s+(\d)/g, "$1$2")
        .trim();

      if (directText.length > 30) {
        allText += directText + " ";
      } else {
        const viewport = page.getViewport({ scale: 3.0 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        const { data: { text } } = await worker.recognize(canvas);
        allText += text + " ";
      }
    }

    await worker.terminate();
    return allText.trim();
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
      "Ideal for creating unforgettable memories.",
      "Experience both adventure and tranquility."
    ];
    const filler = fillerPhrases[Math.floor(Math.random() * fillerPhrases.length)];

    const sentences = [opening, costSentence, activitiesSentence, filler].filter(Boolean);

    return sentences.join(" ");
  };

  const extractItinerary = (rawText, fileName) => {
    let text = collapseDigitSpaces(
      rawText.replace(/\r/g, " ").replace(/\u00A0/g, " ").replace(/\t/g, " ")
    ).replace(/\s{2,}/g, " ");

    const durationRegex = /(\d+)\s*(?:Nights?|N)\s*\/\s*(\d+)\s*(?:Days?|D)/i;
    const durationMatch = text.match(durationRegex);
    const totalDuration = durationMatch
      ? `${durationMatch[1]} Nights / ${durationMatch[2]} Days`
      : text.match(/(\d+)\s*days?/i)?.[1]
      ? `${text.match(/(\d+)\s*days?/i)[1]} Days`
      : "Unknown";

    let totalCost = 0;
    const costPatterns = [
      /\b(?:total|grand\s*total|package\s*cost|package\s*price|amount|rate|price)\b[^\d₹Rs]*₹?\s*Rs?\.?\s*([\d\s,]+)(?:\/-|-)?/i,
      /₹\s*([\d\s,]+)(?:\/-|-)?/i,
      /Rs\.?\s*([\d\s,]+)(?:\/-|-)?/i,
    ];
    for (let regex of costPatterns) {
      const match = text.match(regex);
      if (match) {
        totalCost = parseInt(match[1].replace(/[\s,]/g, ""), 10);
        break;
      }
    }
    if (!totalCost) {
      const allNumbers = [...text.matchAll(/(\d[\d\s,]{3,})/g)].map((m) =>
        parseInt(m[1].replace(/[\s,]/g, ""), 10)
      );
      if (allNumbers.length) totalCost = Math.max(...allNumbers.filter((n) => n > 5000));
    }

    const activities = [];
    const dayBlocks = text.matchAll(/day\s*\d+[\s:-]*(.*?)(?=day\s*\d+|$)/gis);
    for (const block of dayBlocks) {
      const content = block[1].trim();
      if (content.length > 5) activities.push(capitalizeAfterPeriod(content));
    }
    if (!activities.length) activities.push("Sightseeing", "Local activities");

    const itineraryData = {
      name: fileName.replace(/\.pdf$/i, ""),
      tripName: fileName.replace(/\.pdf$/i, ""),
      totalCost: totalCost || 0,
      totalDuration,
      activities: formatActivities(activities),
    };

    itineraryData.tripSummary = generateTripSummary(itineraryData);

    return itineraryData;
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setError("");
  };

  const handleParseClick = async () => {
    if (!selectedFiles.length && !jsonInput.trim()) {
      setError("Please select PDF files or paste JSON data first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const itineraries = [];

      if (jsonInput.trim()) {
        try {
          const parsedData = JSON.parse(jsonInput);
          const finalData = Array.isArray(parsedData) ? parsedData : [parsedData];
          finalData.forEach((it) => {
            it.activities = formatActivities(it.activities || []);
            it.tripSummary = generateTripSummary(it);
          });
          itineraries.push(...finalData);
        } catch (err) {
          setError("Invalid JSON format: " + err.message);
        }
      }

      for (const file of selectedFiles) {
        try {
          const raw = await parsePDF(file);
          const itinerary = extractItinerary(raw, file.name);
          itineraries.push(itinerary);
        } catch (err) {
          console.error("Failed to parse file:", file.name, err);
          const fallbackItinerary = {
            name: file.name.replace(".pdf", ""),
            tripName: file.name.replace(".pdf", ""),
            totalCost: 0,
            totalDuration: "Unknown",
            activities: ["Adventure", "Sightseeing"],
          };
          fallbackItinerary.tripSummary = generateTripSummary(fallbackItinerary);
          itineraries.push(fallbackItinerary);
        }
      }


      if (itineraries.length) {
        onItinerariesUpload(itineraries);
      }

      setJsonInput("");
      setSelectedFiles([]);
    } catch (err) {
      setError("Processing failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isParseButtonDisabled = !selectedFiles.length && !jsonInput.trim();

  return (
    <div className="w-full flex flex-col justify-center items-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-4xl p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl space-y-4 sm:space-y-6 md:space-y-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 text-center">
          ✨ Upload or Paste Itinerary Data
        </h2>

        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-gray-800">Upload PDF Files</h3>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            disabled={isLoading}
            className="block w-full text-xs sm:text-sm md:text-base border-2 border-dashed border-gray-300 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:border-blue-400 transition"
          />
          {selectedFiles.length > 0 && (
            <div className="mt-1 sm:mt-2 text-gray-600 text-xs sm:text-sm">{selectedFiles.length} file(s) selected</div>
          )}
        </div>

        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 text-gray-800">Paste JSON Data</h3>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows="3"
            className="w-full text-xs sm:text-sm md:text-base border border-gray-300 rounded-lg p-2 sm:p-3 font-mono focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder='Example: [{"name":"Trip 1","totalCost":25000,"totalDuration":"5 Days","activities":["Beach","Hiking"]}]'
          />
        </div>

        <button
          onClick={handleParseClick}
          disabled={isParseButtonDisabled || isLoading}
          className={`w-full py-2 sm:py-3 px-4 text-sm sm:text-base font-semibold rounded-lg shadow-md transition
            ${isParseButtonDisabled || isLoading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl"
            }`}
        >
          {isLoading ? "📊 Parsing Itinerary Data..." : "🚀 Parse Itinerary Data"}
        </button>

        {error && (
          <div className="p-2 sm:p-3 rounded-lg text-xs sm:text-sm bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {/* {debugInfo && (
          <details className="border border-gray-200 rounded-lg">
            <summary className="cursor-pointer text-xs sm:text-sm p-2 bg-gray-100">🔧 Debug Info</summary>
            <pre className="text-xs p-2 bg-gray-50 max-h-32 sm:max-h-48 md:max-h-56 overflow-auto">{debugInfo}</pre>
          </details>
        )} */}
      </div>
    </div>
  );
}