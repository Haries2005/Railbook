import React, { createContext, useContext, useState, ReactNode } from "react";

// Use environment variable for API URL
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Train {
  _id?: string;
  id?: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  classes: {
    class_name: string;
    fare: number;
    available_seats: number;
  }[];
}

export interface Passenger {
  name: string;
  age: number;
  gender: "male" | "female";
  aadharNumber: string;
  berth: "lower" | "middle" | "upper" | "side-lower" | "side-upper";
  seatNumber?: string;
}

export interface Booking {
  userId: string;
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
  status: "confirmed" | "waitlisted" | "cancelled";
}

interface AppContextType {
  trains: Train[];
  searchResults: Train[];
  selectedTrain: Train | null;
  selectedClass: string;
  selectedSeats: string[];
  bookings: Booking[];
  journeyDate: string;
  setJourneyDate: React.Dispatch<React.SetStateAction<string>>;
  searchTrains: (
    trainNumber?: string,
    source?: string,
    destination?: string
  ) => Promise<void>;
  selectTrain: (train: Train, className: string, journeyDate: string) => void;
  addTrain: (train: Omit<Train, "id">) => Promise<void>;
  updateTrain: (id: string, train: Omit<Train, "id">) => Promise<void>;
  createBooking: (
    booking: Omit<Booking, "id" | "pnr" | "bookingDate" | "status">
  ) => Promise<Booking>;
  selectSeats: (seats: string[]) => void;
  getAvailableSeats: (
    trainId: string,
    className: string,
    journeyDate: string
  ) => Promise<string[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [searchResults, setSearchResults] = useState<Train[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [journeyDate, setJourneyDate] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const searchTrains = async (
    trainNumber?: string,
    source?: string,
    destination?: string
  ) => {
    try {
      const params = new URLSearchParams();
      if (trainNumber) params.append("trainNumber", trainNumber);
      if (source) params.append("source", source);
      if (destination) params.append("destination", destination);

      const res = await fetch(
        `${BACKEND_URL}/api/trains/search?${params.toString()}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch trains");
      const data = await res.json();
      
      const mappedData = data.map((train: any) => ({
        ...train,
        id: train._id,
        _id: train._id
      }));
      
      setSearchResults(mappedData);
    } catch (err) {
      console.error("❌ Error fetching trains:", err);
      setSearchResults([]);
    }
  };

  const selectTrain = (train: Train, className: string, date: string) => {
    setSelectedTrain(train);
    setSelectedClass(className);
    setJourneyDate(date);
    setSelectedSeats([]);
  };

  const addTrain = async (train: Omit<Train, "id">) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/trains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(train),
      });
      if (!res.ok) throw new Error("Failed to add train");
      const newTrain = await res.json();
      setTrains((prev) => [...prev, newTrain]);
    } catch (err) {
      console.error("❌ Error adding train:", err);
    }
  };

  const updateTrain = async (id: string, train: Omit<Train, "id">) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/trains/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(train),
      });
      if (!res.ok) throw new Error("Failed to update train");
      const updated = await res.json();
      setTrains((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("❌ Error updating train:", err);
    }
  };

  const createBooking = async (
    bookingData: Omit<Booking, "id" | "pnr" | "bookingDate" | "status">
  ): Promise<Booking> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const res = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to create booking");
      }

      const booking: Booking = {
        ...responseData,
        bookingDate: new Date(responseData.bookingDate)
      };
      
      setBookings((prev) => [...prev, booking]);
      return booking;
    } catch (err: any) {
      console.error("❌ Error creating booking:", err);
      throw new Error(err.message || "Booking failed");
    }
  };

  const selectSeats = (seats: string[]) => setSelectedSeats(seats);

  const getAvailableSeats = async (
    trainId: string,
    className: string,
    journeyDate: string
  ): Promise<string[]> => {
    try {
      if (!trainId) return [];

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BACKEND_URL}/api/seats?trainId=${trainId}&className=${className}&journeyDate=${journeyDate}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!res.ok) return [];

      const seats = await res.json();
      return seats;
    } catch (err) {
      console.log("⚠️ Error fetching seats:", err);
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        trains,
        searchResults,
        selectedTrain,
        selectedClass,
        selectedSeats,
        bookings,
        journeyDate,
        setJourneyDate,
        searchTrains,
        selectTrain,
        addTrain,
        updateTrain,
        createBooking,
        selectSeats,
        getAvailableSeats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};