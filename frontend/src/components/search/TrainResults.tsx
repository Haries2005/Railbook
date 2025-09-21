import React from 'react';
import { Clock, MapPin, ArrowRight, Calendar, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Train } from '../../contexts/AppContext';
import { useState } from 'react';

interface TrainResultsProps {
  onNavigate: (page: string) => void;
}

const TrainResults: React.FC<TrainResultsProps> = ({ onNavigate }) => {
  const { searchResults, selectTrain, journeyDate } = useApp();
  const [selectedJourneyDate] = useState(journeyDate);

  const handleBooking = (train: Train, className: string) => {
    selectTrain(train, className, selectedJourneyDate);
    onNavigate('booking');
  };

  const getClassColor = (className: string) => {
    switch (className) {
      case '1A': return 'bg-purple-600 text-white';
      case '2A': return 'bg-blue-600 text-white';
      case '3A': return 'bg-green-600 text-white';
      case 'CC': return 'bg-orange-600 text-white';
      case 'EC': return 'bg-red-600 text-white';
      case 'SL': return 'bg-yellow-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const formatTime = (time: string) => {
    return time.replace('+1', ' (+1)');
  };

  if (searchResults.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Trains Found</h2>
            <p className="text-slate-400 mb-8">
              We couldn't find any trains matching your search criteria. Please try with different parameters.
            </p>
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
            >
              Search Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Available Trains</h1>
            <p className="text-slate-400">
              Found {searchResults.length} train{searchResults.length !== 1 ? 's' : ''} for your search
            </p>
          </div>
          <button
            onClick={() => onNavigate('search')}
            className="mt-4 sm:mt-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
          >
            Modify Search
          </button>
        </div>

        {/* Train Results */}
        <div className="space-y-6">
          {searchResults.map((train) => (
            <div key={train.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all">
              {/* Train Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{train.name}</h2>
                    <p className="text-slate-400">#{train.number}</p>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">From</p>
                    <p className="font-medium text-white">{train.source}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <ArrowRight className="h-4 w-4" />
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">To</p>
                    <p className="font-medium text-white">{train.destination}</p>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center justify-center mb-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Departure</p>
                  <p className="text-xl font-bold text-white">{formatTime(train.departureTime)}</p>
                </div>
                <div className="mx-8 flex items-center">
                  <div className="h-px w-16 bg-slate-600"></div>
                  <ArrowRight className="h-5 w-5 text-slate-400 mx-2" />
                  <div className="h-px w-16 bg-slate-600"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Arrival</p>
                  <p className="text-xl font-bold text-white">{formatTime(train.arrivalTime)}</p>
                </div>
              </div>

              {/* Available Classes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Available Classes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {train.classes.map((trainClass) => (
                    <div key={trainClass.name} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassColor(trainClass.name)}`}>
                          {trainClass.name}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {trainClass.available} seats
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-white">₹{trainClass.price}</span>
                        <span className="text-xs text-slate-400">per person</span>
                      </div>
                      <button
                        onClick={() => handleBooking(train, trainClass.name)}
                        disabled={trainClass.available === 0}
                        className={`w-full py-2 rounded-lg font-medium transition-all ${
                          trainClass.available === 0
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                        }`}
                      >
                        {trainClass.available === 0 ? 'Sold Out' : 'Book Now'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainResults;