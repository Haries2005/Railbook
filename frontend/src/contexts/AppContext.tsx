import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Train {
  id: string;
  number: string;
  name: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  classes: {
    name: string;
    price: number;
    available: number;
  }[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: 'male' | 'female';
  aadharNumber: string;
  berth: 'lower' | 'middle' | 'upper' | 'side-lower' | 'side-upper';
  seatNumber?: string;
}

export interface Booking {
  id: string;
  pnr: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  selectedClass: string;
  passengers: Passenger[];
  mobileNumber: string;
  totalFare: number;
  bookingDate: Date;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
}

interface AppContextType {
  trains: Train[];
  searchResults: Train[];
  selectedTrain: Train | null;
  selectedClass: string;
  selectedSeats: string[];
  bookings: Booking[];
  journeyDate: string;
  searchTrains: (trainNumber?: string, source?: string, destination?: string) => void;
  selectTrain: (train: Train, className: string, journeyDate: string) => void;
  addTrain: (train: Omit<Train, 'id'>) => void;
  updateTrain: (id: string, train: Omit<Train, 'id'>) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'pnr' | 'bookingDate' | 'status'>) => Booking;
  selectSeats: (seats: string[]) => void;
  getAvailableSeats: (trainId: string, className: string, journeyDate: string) => string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [trains] = useState<Train[]>([
    {
      id: '1',
      number: '12301',
      name: 'Rajdhani Express',
      source: 'New Delhi',
      destination: 'Mumbai Central',
      departureTime: '16:55',
      arrivalTime: '08:35+1',
      classes: [
        { name: '1A', price: 4500, available: 10 },
        { name: '2A', price: 3200, available: 25 },
        { name: '3A', price: 2300, available: 40 }
      ]
    },
    {
      id: '2',
      number: '12002',
      name: 'Shatabdi Express',
      source: 'New Delhi',
      destination: 'Chandigarh',
      departureTime: '17:40',
      arrivalTime: '20:35',
      classes: [
        { name: 'CC', price: 1200, available: 60 },
        { name: 'EC', price: 2400, available: 20 }
      ]
    },
    {
      id: '3',
      number: '16649',
      name: 'Parasuram Express',
      source: 'Chennai Central',
      destination: 'Mangalore Central',
      departureTime: '14:30',
      arrivalTime: '06:30+1',
      classes: [
        { name: 'SL', price: 800, available: 150 },
        { name: '3A', price: 1800, available: 45 },
        { name: '2A', price: 2800, available: 25 }
      ]
    }
  ]);

  const [searchResults, setSearchResults] = useState<Train[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [journeyDate, setJourneyDate] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const searchTrains = (trainNumber?: string, source?: string, destination?: string) => {
    let results = trains;

    if (trainNumber && trainNumber.trim()) {
      results = results.filter(train => 
        train.number.toLowerCase().includes(trainNumber.toLowerCase()) ||
        train.name.toLowerCase().includes(trainNumber.toLowerCase())
      );
    }

    if (source && source.trim()) {
      results = results.filter(train => 
        train.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (destination && destination.trim()) {
      results = results.filter(train => 
        train.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    setSearchResults(results);
  };

  const selectTrain = (train: Train, className: string, journeyDate: string) => {
    setSelectedTrain(train);
    setSelectedClass(className);
    setJourneyDate(journeyDate);
    setSelectedSeats([]);
  };

  const addTrain = (train: Omit<Train, 'id'>) => {
    // In a real app, this would make an API call
    console.log('Adding train:', train);
  };

  const updateTrain = (id: string, train: Omit<Train, 'id'>) => {
    // In a real app, this would make an API call
    console.log('Updating train:', id, train);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'pnr' | 'bookingDate'>): Booking => {
    const booking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      pnr: generatePNR(),
      bookingDate: new Date(),
      status: 'confirmed'
    };

    setBookings(prev => [...prev, booking]);
    return booking;
  };

  const selectSeats = (seats: string[]) => {
    setSelectedSeats(seats);
  };

  const getAvailableSeats = (trainId: string, className: string, journeyDate: string): string[] => {
    // Mock seat availability - in real app, this would be an API call
    const totalSeats = className === 'SL' ? 72 : className === '3A' ? 64 : className === '2A' ? 46 : 18;
    const bookedSeats = Math.floor(Math.random() * 20); // Random booked seats
    
    const allSeats: string[] = [];
    for (let i = 1; i <= totalSeats; i++) {
      allSeats.push(i.toString());
    }
    
    // Remove some random seats as booked
    const availableSeats = allSeats.slice(bookedSeats);
    return availableSeats;
  };
  const generatePNR = (): string => {
    // Generate 10-digit numeric PNR
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const value: AppContextType = {
    trains,
    searchResults,
    selectedTrain,
    selectedClass,
    selectedSeats,
    bookings,
    journeyDate,
    searchTrains,
    selectTrain,
    addTrain,
    updateTrain,
    createBooking,
    selectSeats,
    getAvailableSeats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};