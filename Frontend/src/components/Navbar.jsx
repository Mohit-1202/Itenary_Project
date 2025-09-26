export default function Navbar() {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            IC
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">Itinerary Comparer</h1>
        </div>
        <nav className="space-x-4 text-gray-600 font-medium">
          <button className="hover:text-blue-500 transition">Home</button>
          <button className="hover:text-blue-500 transition">Upload</button>
          <button className="hover:text-blue-500 transition">About</button>
        </nav>
      </div>
    </header>
  );
}
