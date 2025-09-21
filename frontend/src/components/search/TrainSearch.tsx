import React, { useState } from 'react';
import { Search, Train, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface TrainSearchProps {
  onNavigate: (page: string) => void;
}

const TrainSearch: React.FC<TrainSearchProps> = ({ onNavigate }) => {
  const [searchData, setSearchData] = useState({
    trainNumber: '',
    source: '',
    destination: '',
    journeyDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { searchTrains } = useApp();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // At least one field must be filled
    if (!searchData.trainNumber.trim() && !searchData.source.trim() && !searchData.destination.trim()) {
      newErrors.general = 'Please fill at least one search field';
    }

    if (!searchData.journeyDate) {
      newErrors.journeyDate = 'Journey date is required';
    } else {
      const selectedDate = new Date(searchData.journeyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.journeyDate = 'Journey date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Perform search
    searchTrains(
      searchData.trainNumber || undefined,
      searchData.source || undefined,
      searchData.destination || undefined
    );
    
    // Navigate to results
    onNavigate('results');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors.general) {
      setErrors({});
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Train className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Journey</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Search for trains by number, route, or destinations. Book your tickets with ease.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          {errors.general && (
            <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.journeyDate ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.journeyDate && <p className="text-sm text-red-400">{errors.journeyDate}</p>}
            </div>

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
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 12301 or Rajdhani"
                />
              </div>
            </div>

            {/* Source Station */}
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
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., New Delhi"
                />
              </div>
            </div>

            {/* Destination Station */}
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
                  className="w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Mumbai Central"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-8">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Trains</span>
              </div>
            </button>
          </div>

          {/* Search Tips */}
          <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Search Tips:</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Enter train number (e.g., 12301) or train name (e.g., Rajdhani) for specific trains</li>
              <li>• Use source and destination to find all trains on a route</li>
              <li>• You can search with any combination of the above fields</li>
            </ul>
          </div>
        </form>

        {/* Popular Routes */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
               onClick={() => {
                 setSearchData({ trainNumber: '', source: 'New Delhi', destination: 'Mumbai Central', journeyDate: '' });
               }}>
            <h3 className="font-medium text-white mb-1">Delhi → Mumbai</h3>
            <p className="text-sm text-slate-400">Popular business route</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
               onClick={() => {
                 setSearchData({ trainNumber: '', source: 'Chennai Central', destination: 'Bengaluru', journeyDate: '' });
               }}>
            <h3 className="font-medium text-white mb-1">Chennai → Bengaluru</h3>
            <p className="text-sm text-slate-400">Tech hub connection</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
               onClick={() => {
                 setSearchData({ trainNumber: '', source: 'Kolkata', destination: 'New Delhi', journeyDate: '' });
               }}>
            <h3 className="font-medium text-white mb-1">Kolkata → Delhi</h3>
            <p className="text-sm text-slate-400">Capital express</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainSearch;