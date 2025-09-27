export default function Navbar() {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl md:text-2xl shadow-md sm:shadow-lg">
            IC
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-800 truncate">
            Itinerary Comparer
          </h1>
        </div>
        <nav className="flex space-x-2 sm:space-x-3 md:space-x-4 text-gray-600 font-medium">
          <button className="text-xs sm:text-sm hover:text-blue-500 transition px-1 sm:px-2 py-1">Home</button>
          <button className="text-xs sm:text-sm hover:text-blue-500 transition px-1 sm:px-2 py-1">Upload</button>
          <button className="text-xs sm:text-sm hover:text-blue-500 transition px-1 sm:px-2 py-1">About</button>
        </nav>
      </div>
    </header>
  );
}