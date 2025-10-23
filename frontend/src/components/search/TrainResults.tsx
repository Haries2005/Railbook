import React, { useState } from "react";
import { Clock, MapPin, ArrowRight, Calendar, Train as TrainIcon } from "lucide-react";
import { useApp, Train } from "../../contexts/AppContext";

interface TrainResultsProps {
  onNavigate: (page: string) => void;
}

const TrainResults: React.FC<TrainResultsProps> = ({ onNavigate }) => {
  const { searchResults, selectTrain, journeyDate } = useApp();
  const [selectedClasses, setSelectedClasses] = useState<{ [key: string]: string }>({});

  const handleClassSelect = (trainId: string, className: string) => {
    setSelectedClasses((prev) => ({ ...prev, [trainId]: className }));
  };

  const handleBooking = (train: Train) => {
    const selectedClass = selectedClasses[train._id] || train.classes[0]?.class_name || "Sleeper";
    selectTrain(train, selectedClass, journeyDate);
    onNavigate("booking");
  };

  const formatTime = (time: string) => (time ? time.replace("+1", " (+1)") : "--");

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto bg-slate-800 p-12 rounded-2xl border border-slate-700">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No Trains Found</h2>
          <p className="text-slate-400 mb-8">
            Try searching with different source and destination.
          </p>
          <button
            onClick={() => onNavigate("search")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Search Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {searchResults.map((train) => (
          <div
            key={train._id}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all"
          >
            {/* Train Header */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                <TrainIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{train.train_name}</h2>
                <p className="text-slate-400">#{train.train_number}</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">From</p>
                  <p className="font-medium text-white">{train.source_station}</p>
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
                  <p className="font-medium text-white">{train.destination_station}</p>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="flex items-center justify-center mb-6 p-4 bg-slate-700/50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-slate-400">Departure</p>
                <p className="text-xl font-bold text-white">{formatTime(train.departure_time)}</p>
              </div>
              <div className="mx-8 flex items-center">
                <div className="h-px w-16 bg-slate-600"></div>
                <ArrowRight className="h-5 w-5 text-slate-400 mx-2" />
                <div className="h-px w-16 bg-slate-600"></div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Arrival</p>
                <p className="text-xl font-bold text-white">{formatTime(train.arrival_time)}</p>
              </div>
            </div>

            {/* Available Classes */}
            {train.classes && train.classes.length > 0 && (
              <div className="mb-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Select Class</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {train.classes.map((cls) => (
                    <button
                      key={cls.class_name}
                      onClick={() => handleClassSelect(train._id, cls.class_name)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedClasses[train._id] === cls.class_name
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent scale-105"
                          : "border-slate-600 text-slate-300 hover:border-slate-400 hover:scale-105"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">{cls.class_name}</span>
                        <span className="text-sm">₹{cls.fare}</span>
                        <span className="text-xs opacity-75">{cls.available_seats} seats</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Button */}
            <div className="text-center">
              <button
                onClick={() => handleBooking(train)}
                disabled={!selectedClasses[train._id] && train.classes.length > 1}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {selectedClasses[train._id] || train.classes.length === 1 ? 'Book Ticket' : 'Select a Class First'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainResults;