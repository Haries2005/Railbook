import React, { useState } from "react";
import { Search, Train, MapPin } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

interface TrainSearchProps {
  onNavigate: (page: string) => void;
}

const TrainSearch: React.FC<TrainSearchProps> = ({ onNavigate }) => {
  const { searchTrains, setJourneyDate } = useApp();
  const [searchData, setSearchData] = useState({
    trainNumber: "",
    source: "",
    destination: "",
    journeyDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (
      !searchData.trainNumber.trim() &&
      !searchData.source.trim() &&
      !searchData.destination.trim()
    ) {
      newErrors.general = "Please fill at least one search field";
    }
    if (!searchData.journeyDate) {
      newErrors.journeyDate = "Journey date is required";
    } else {
      const selectedDate = new Date(searchData.journeyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today)
        newErrors.journeyDate = "Journey date cannot be in the past";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Only search by trainNumber/source/destination
      await searchTrains(
        searchData.trainNumber,
        searchData.source,
        searchData.destination
      );

      // Store journeyDate locally for ticket
      setJourneyDate(searchData.journeyDate);

      onNavigate("results");
    } catch (err) {
      console.error("❌ Error fetching trains:", err);
      setErrors({ general: "Failed to fetch trains. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
    if (errors.general) setErrors({});
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Train className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Journey</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Search for trains by number, route, or destinations. Book your tickets with ease.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700"
        >
          {errors.general && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Train Number */}
            <div className="space-y-2">
              <label htmlFor="trainNumber" className="block text-sm font-medium text-slate-300">
                Train Number / Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Train className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="trainNumber"
                  name="trainNumber"
                  type="text"
                  value={searchData.trainNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  placeholder="e.g., 12301 or Rajdhani"
                />
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <label htmlFor="source" className="block text-sm font-medium text-slate-300">
                From Station
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="source"
                  name="source"
                  type="text"
                  value={searchData.source}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  placeholder="e.g., New Delhi"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label htmlFor="destination" className="block text-sm font-medium text-slate-300">
                To Station
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  value={searchData.destination}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all"
                  placeholder="e.g., Mumbai Central"
                />
              </div>
            </div>
            {/* Journey Date */}
            <div className="space-y-2 md:col-span-3">
              <label htmlFor="journeyDate" className="block text-sm font-medium text-slate-300">
                Journey Date *
              </label>
              <input
                id="journeyDate"
                name="journeyDate"
                type="date"
                value={searchData.journeyDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.journeyDate ? "border-red-500" : "border-slate-600"
                }`}
              />
              {errors.journeyDate && (
                <p className="text-sm text-red-400">{errors.journeyDate}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 focus:outline-none disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>{loading ? "Searching..." : "Search Trains"}</span>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainSearch;
