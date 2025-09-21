import React, { useState, useEffect } from 'react';
import { Train, Users, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SeatSelectionProps {
  onSeatsSelected: (seats: string[]) => void;
  requiredSeats: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onSeatsSelected, requiredSeats }) => {
  const { selectedTrain, selectedClass, journeyDate, getAvailableSeats, selectedSeats, selectSeats } = useApp();
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [bookedSeats] = useState<string[]>(['5', '12', '18', '23', '31', '44', '52', '67']); // Mock booked seats

  useEffect(() => {
    if (selectedTrain && selectedClass && journeyDate) {
      const seats = getAvailableSeats(selectedTrain.id, selectedClass, journeyDate);
      setAvailableSeats(seats);
    }
  }, [selectedTrain, selectedClass, journeyDate, getAvailableSeats]);

  const handleSeatClick = (seatNumber: string) => {
    if (bookedSeats.includes(seatNumber)) return;

    let newSelectedSeats = [...selectedSeats];
    
    if (newSelectedSeats.includes(seatNumber)) {
      newSelectedSeats = newSelectedSeats.filter(seat => seat !== seatNumber);
    } else if (newSelectedSeats.length < requiredSeats) {
      newSelectedSeats.push(seatNumber);
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
      case 'booked': return 'bg-red-500 cursor-not-allowed';
      case 'selected': return 'bg-green-500 text-white';
      case 'available': return 'bg-slate-600 hover:bg-slate-500 cursor-pointer';
      default: return 'bg-slate-600';
    }
  };

  const renderSeats = () => {
    const totalSeats = selectedClass === 'SL' ? 72 : selectedClass === '3A' ? 64 : selectedClass === '2A' ? 46 : 18;
    const seatsPerRow = selectedClass === 'SL' ? 6 : 4;
    const seats = [];

    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = i.toString();
      const status = getSeatStatus(seatNumber);
      
      seats.push(
        <button
          key={seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
          disabled={status === 'booked'}
          className={`w-10 h-10 rounded-lg border-2 border-slate-500 flex items-center justify-center text-sm font-medium transition-all ${getSeatColor(status)}`}
        >
          {status === 'selected' ? <Check className="h-4 w-4" /> : seatNumber}
        </button>
      );

      // Add aisle space
      if (i % seatsPerRow === 0 && i < totalSeats) {
        seats.push(<div key={`aisle-${i}`} className="w-full h-4"></div>);
      }
    }

    return seats;
  };

  if (!selectedTrain || !selectedClass) {
    return null;
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Train className="h-5 w-5 mr-2" />
          Select Seats ({selectedSeats.length}/{requiredSeats})
        </h2>
        <div className="text-sm text-slate-400">
          Coach: {selectedClass}
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
      <div className="bg-slate-700/30 p-4 rounded-lg">
        <div className="text-center mb-4">
          <div className="inline-block bg-slate-600 px-4 py-2 rounded-lg text-white text-sm font-medium">
            Engine →
          </div>
        </div>
        
        <div className={`grid gap-2 justify-center ${
          selectedClass === 'SL' ? 'grid-cols-6' : 'grid-cols-4'
        }`}>
          {renderSeats()}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-500 rounded-lg">
          <p className="text-green-200 text-sm">
            Selected Seats: {selectedSeats.join(', ')}
          </p>
        </div>
      )}

      {selectedSeats.length < requiredSeats && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg">
          <p className="text-yellow-200 text-sm">
            Please select {requiredSeats - selectedSeats.length} more seat{requiredSeats - selectedSeats.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;