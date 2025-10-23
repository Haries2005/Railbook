import React, { useState, useEffect } from 'react';
import { Train, Check, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import axios from 'axios';

interface SeatSelectionProps {
  onSeatsSelected: (seats: string[]) => void;
  requiredSeats: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onSeatsSelected, requiredSeats }) => {
  const {
    selectedTrain,
    selectedClass,
    journeyDate,
    selectedSeats,
    selectSeats
  } = useApp();

  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<string>('S1');

  // Coach configuration for Indian Railways
  const getCoachConfig = () => {
    if (!selectedClass) return [];
    
    const classLower = selectedClass.toLowerCase();
    
    if (classLower.includes('sleeper') || classLower === 'sl') {
      return ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
    } else if (classLower.includes('3a') || classLower.includes('ac 3')) {
      return ['B1', 'B2', 'B3', 'B4', 'B5'];
    } else if (classLower.includes('2a') || classLower.includes('ac 2')) {
      return ['A1', 'A2', 'A3'];
    } else if (classLower.includes('1a') || classLower.includes('ac 1')) {
      return ['H1'];
    } else {
      return ['C1'];
    }
  };

  const coaches = getCoachConfig();

  // Get seat layout for selected class
  const getSeatLayout = () => {
    if (!selectedClass) return { seatsPerCoach: 72, layout: 'sleeper' };
    
    const classLower = selectedClass.toLowerCase();
    
    if (classLower.includes('sleeper') || classLower === 'sl') {
      return { seatsPerCoach: 72, layout: 'sleeper' };
    } else if (classLower.includes('3a') || classLower.includes('ac 3')) {
      return { seatsPerCoach: 64, layout: '3ac' };
    } else if (classLower.includes('2a') || classLower.includes('ac 2')) {
      return { seatsPerCoach: 46, layout: '2ac' };
    } else if (classLower.includes('1a') || classLower.includes('ac 1')) {
      return { seatsPerCoach: 18, layout: '1ac' };
    } else {
      return { seatsPerCoach: 72, layout: 'sleeper' };
    }
  };

  const { seatsPerCoach, layout } = getSeatLayout();

  // Fetch booked seats from backend
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!selectedTrain || !selectedClass || !journeyDate) return;
      
      setLoading(true);
      try {
        console.log('🔍 Fetching booked seats...');
        
        const res = await axios.get('http://localhost:5000/api/seats/booked', {
          params: {
            train_id: selectedTrain._id,
            class_name: selectedClass,
            journey_date: journeyDate,
          },
        });

        console.log('✅ Booked seats:', res.data);
        setBookedSeats(res.data);
      } catch (err) {
        console.error('❌ Error fetching booked seats:', err);
        setBookedSeats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSeats();
  }, [selectedTrain, selectedClass, journeyDate]);

  const handleSeatClick = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) {
      alert('This seat is already booked!');
      return;
    }

    let newSelectedSeats = [...selectedSeats];
    
    if (newSelectedSeats.includes(seatNumber)) {
      newSelectedSeats = newSelectedSeats.filter(seat => seat !== seatNumber);
    } else if (newSelectedSeats.length < requiredSeats) {
      newSelectedSeats.push(seatNumber);
    } else {
      alert(`You can only select ${requiredSeats} seat(s)`);
      return;
    }
    
    selectSeats(newSelectedSeats);
    onSeatsSelected(newSelectedSeats);
  };

  const getSeatStatus = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) return 'booked';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-red-500 text-white cursor-not-allowed';
      case 'selected': return 'bg-green-500 text-white cursor-pointer';
      case 'available': return 'bg-slate-600 hover:bg-slate-500 cursor-pointer text-white';
      default: return 'bg-slate-600';
    }
  };

  const renderSleeperCoach = () => {
    const seats = [];
    const totalSeats = seatsPerCoach;
    
    // Sleeper layout: 8 seats per compartment (2 side lower/upper + 3 lower/middle/upper on each side)
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `${selectedCoach}-${i}`;
      const status = getSeatStatus(seatNumber);
      
      // Side berths (every 8th seat is side lower, every 8th+4 is side upper)
      const isSideBerth = (i % 8 === 7) || (i % 8 === 0);
      
      seats.push(
        <button
          key={seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
          disabled={status === 'booked'}
          className={`relative flex items-center justify-center text-xs font-medium transition-all border border-slate-500 ${
            isSideBerth ? 'w-16 h-8' : 'w-12 h-10'
          } ${getSeatColor(status)}`}
          title={`Seat ${seatNumber} - ${status}`}
        >
          {status === 'selected' ? <Check className="h-4 w-4" /> : 
           status === 'booked' ? <X className="h-4 w-4" /> : i}
        </button>
      );
      
      // Add spacing after compartments
      if (i % 8 === 0 && i < totalSeats) {
        seats.push(<div key={`space-${i}`} className="w-full h-2"></div>);
      }
    }
    
    return (
      <div className="grid grid-cols-8 gap-1 justify-center">
        {seats}
      </div>
    );
  };

  const render3ACCoach = () => {
    const seats = [];
    const totalSeats = seatsPerCoach;
    
    // 3AC layout: 6 berths per compartment (side lower/upper + lower/middle/upper on each side)
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = `${selectedCoach}-${i}`;
      const status = getSeatStatus(seatNumber);
      
      const isSideBerth = (i % 8 === 7) || (i % 8 === 0);
      
      seats.push(
        <button
          key={seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
          disabled={status === 'booked'}
          className={`relative flex items-center justify-center text-xs font-medium transition-all border border-slate-500 ${
            isSideBerth ? 'w-16 h-8' : 'w-12 h-10'
          } ${getSeatColor(status)}`}
        >
          {status === 'selected' ? <Check className="h-4 w-4" /> : 
           status === 'booked' ? <X className="h-4 w-4" /> : i}
        </button>
      );
      
      if (i % 8 === 0 && i < totalSeats) {
        seats.push(<div key={`space-${i}`} className="w-full h-2"></div>);
      }
    }
    
    return (
      <div className="grid grid-cols-8 gap-1 justify-center">
        {seats}
      </div>
    );
  };

  const renderGenericCoach = () => {
    const seats = [];
    const cols = layout === '1ac' ? 4 : 6;
    
    for (let i = 1; i <= seatsPerCoach; i++) {
      const seatNumber = `${selectedCoach}-${i}`;
      const status = getSeatStatus(seatNumber);
      
      seats.push(
        <button
          key={seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
          disabled={status === 'booked'}
          className={`w-12 h-10 flex items-center justify-center text-xs font-medium transition-all border border-slate-500 ${getSeatColor(status)}`}
        >
          {status === 'selected' ? <Check className="h-4 w-4" /> : 
           status === 'booked' ? <X className="h-4 w-4" /> : i}
        </button>
      );
    }
    
    return (
      <div className={`grid grid-cols-${cols} gap-1 justify-center`}>
        {seats}
      </div>
    );
  };

  if (!selectedTrain || !selectedClass) return null;
  
  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="text-slate-300 text-center">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Train className="h-5 w-5 mr-2" />
          Select Seats ({selectedSeats.length}/{requiredSeats})
        </h2>
      </div>

      {/* Coach Selection */}
      <div className="mb-6">
        <p className="text-sm text-slate-400 mb-3">Select Coach:</p>
        <div className="flex flex-wrap gap-2">
          {coaches.map(coach => (
            <button
              key={coach}
              onClick={() => setSelectedCoach(coach)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCoach === coach
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {coach}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 mb-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-slate-600 rounded"></div>
          <span className="text-sm text-slate-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-slate-300">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-slate-300">Booked</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-slate-700/30 p-6 rounded-lg max-h-96 overflow-y-auto">
        <div className="text-center mb-4">
          <div className="inline-block bg-slate-600 px-6 py-2 rounded-lg text-white text-sm font-medium">
            {selectedCoach} - {selectedClass}
          </div>
        </div>

        {layout === 'sleeper' && renderSleeperCoach()}
        {layout === '3ac' && render3ACCoach()}
        {(layout === '2ac' || layout === '1ac') && renderGenericCoach()}
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
          <p className="text-sm text-blue-200">
            <strong>Selected Seats:</strong> {selectedSeats.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;