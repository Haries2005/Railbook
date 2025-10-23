import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Download, Eye, Train, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import axios from 'axios';

interface MyBookingsProps {
  onNavigate: (page: string) => void;
}

interface Passenger {
  name: string;
  age: number;
  gender: string;
  berth: string;
  seatNumber?: string;
}

interface Booking {
  id: string;
  pnr: string;
  bookingDate: string;
  trainName: string;
  trainNumber: string;
  journeyDate: string;
  selectedClass: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  passengers: Passenger[];
  mobileNumber: string;
  totalFare: number;
  status: string;
}

const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch bookings from backend
  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Fetching bookings...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view bookings');
        setLoading(false);
        return;
      }

      // ✅ CORRECT endpoint - just /api/bookings (backend filters by user)
      const res = await axios.get('https://railbook-u0cg.onrender.com/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Bookings fetched:', res.data);
      setBookings(res.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching bookings:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

const generatePDF = (booking: Booking) => {
  const doc = new jsPDF();

  // === HEADER DESIGN ===
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(0, 0, 210, 35, "F");

  // Gradient stripes
  doc.setFillColor(59, 130, 246, 0.8);
  doc.rect(0, 0, 210, 8, "F");
  doc.setFillColor(147, 51, 234, 0.6);
  doc.rect(0, 8, 210, 8, "F");
  doc.setFillColor(59, 130, 246, 0.4);
  doc.rect(0, 16, 210, 8, "F");

  // Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("RAILBOOK", 20, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Your Premium Journey Companion", 20, 28);

  // Ticket Type
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("E-TICKET", 160, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Electronic Reservation Slip", 160, 28);

  // === MAIN BORDER ===
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.rect(15, 40, 180, 210, "S");

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(18, 43, 174, 204, "S");

  // === PNR SECTION ===
  doc.setFillColor(239, 246, 255);
  doc.rect(20, 48, 170, 22, "F");
  doc.setDrawColor(59, 130, 246);
  doc.rect(20, 48, 170, 22, "S");

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`PNR: ${booking.pnr}`, 25, 62);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(`Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, 25, 67);
  doc.text(`Journey Date: ${new Date(booking.journeyDate).toLocaleDateString()}`, 130, 67);

  // === TRAIN DETAILS ===
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("TRAIN DETAILS", 25, 85);

  doc.setDrawColor(59, 130, 246);
  doc.line(25, 88, 185, 88);

  const trainDetails = [
    ["Train Name:", booking.trainName],
    ["Train Number:", booking.trainNumber],
    ["Class:", booking.selectedClass],
    ["From Station:", booking.source],
    ["To Station:", booking.destination],
    ["Departure Time:", booking.departureTime],
    ["Arrival Time:", booking.arrivalTime],
  ];

  let yPos = 95;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  trainDetails.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(55, 65, 81);
    doc.text(label, 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(value || "N/A", 85, yPos);
    yPos += 7;
  });

  // === PASSENGER DETAILS ===
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("PASSENGER DETAILS", 25, yPos + 15);

  doc.setDrawColor(59, 130, 246);
  doc.line(25, yPos + 18, 185, yPos + 18);

  yPos += 28;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text("S.No", 25, yPos);
  doc.text("Passenger Name", 40, yPos);
  doc.text("Age", 110, yPos);
  doc.text("Gender", 130, yPos);
  doc.text("Seat", 155, yPos);
  doc.text("Berth", 175, yPos);

  doc.setDrawColor(156, 163, 175);
  doc.line(25, yPos + 2, 185, yPos + 2);

  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  booking.passengers.forEach((p: any, i: number) => {
    doc.text(`${i + 1}`, 25, yPos);
    doc.text(p.name || "N/A", 40, yPos);
    doc.text(`${p.age || "-"}`, 110, yPos);
    doc.text(p.gender?.toUpperCase() || "-", 130, yPos);
    doc.text(p.seatNumber || "N/A", 155, yPos);
    doc.text(p.berth?.toUpperCase() || "-", 175, yPos);
    yPos += 7;
  });

  // === CONTACT INFO ===
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("CONTACT INFORMATION", 25, yPos + 15);

  doc.setDrawColor(59, 130, 246);
  doc.line(25, yPos + 18, 185, yPos + 18);

  yPos += 28;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Mobile: ${booking.mobileNumber}`, 25, yPos);

  // === FARE DETAILS ===
  doc.setFillColor(16, 185, 129);
  doc.rect(20, yPos + 18, 170, 28, "F");
  doc.setDrawColor(5, 150, 105);
  doc.rect(20, yPos + 18, 170, 28, "S");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL FARE: ₹${booking.totalFare}`, 25, yPos + 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("(Including all taxes and fees)", 25, yPos + 41);

  // === STATUS BADGE ===
  const statusColor =
    booking.status === "confirmed"
      ? [34, 197, 94]
      : booking.status === "cancelled"
      ? [239, 68, 68]
      : [251, 191, 36];

  doc.setFillColor(...statusColor);
  doc.rect(140, yPos + 25, 45, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(booking.status.toUpperCase(), 145, yPos + 33);

  // === NOTES ===
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT:", 25, yPos + 58);

  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("• Please carry a valid photo ID proof during journey", 25, yPos + 65);
  doc.text("• Report at the station 30 minutes before departure", 25, yPos + 70);
  doc.text("• This is a computer generated ticket and does not require signature", 25, yPos + 75);

  // === FOOTER ===
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos + 82, 170, 20, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(20, yPos + 82, 170, 20, "S");

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for choosing RAILBOOK!", 105, yPos + 92, { align: "center" });

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("24/7 Support: support@railbook.com | +91-1800-RAILBOOK", 105, yPos + 97, { align: "center" });

  // === SAVE FILE ===
  doc.save(`railbook-ticket-${booking.pnr}.pdf`);
};

  if (loading) {
    return (
      <div className="text-white text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => onNavigate('search')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Go to Search
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-white">
        <Train className="h-16 w-16 mx-auto mb-4 text-slate-400" />
        <p className="text-xl mb-2">No bookings found</p>
        <p className="text-slate-400 mb-6">Book your first train ticket now!</p>
        <button
          onClick={() => onNavigate('search')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Search Trains
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-slate-400">View and manage your train reservations</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{booking.trainName}</h2>
                <div className="flex items-center space-x-3 text-sm text-slate-400">
                  <span className="flex items-center">
                    <Train className="h-4 w-4 mr-1" />
                    {booking.trainNumber}
                  </span>
                  <span>•</span>
                  <span className="font-mono">PNR: {booking.pnr}</span>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'confirmed'
                    ? 'bg-green-900/50 text-green-300 border border-green-500'
                    : booking.status === 'cancelled'
                    ? 'bg-red-900/50 text-red-300 border border-red-500'
                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-500'
                }`}
              >
                {booking.status.toUpperCase()}
              </span>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">From</p>
                  <p className="text-white font-medium">{booking.source}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">To</p>
                  <p className="text-white font-medium">{booking.destination}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Journey Date</p>
                  <p className="text-white font-medium">
                    {new Date(booking.journeyDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Time & Class Info */}
            <div className="flex items-center space-x-6 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <span>Departure: {booking.departureTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <span>Arrival: {booking.arrivalTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Class: {booking.selectedClass}
                </span>
              </div>
            </div>

            {/* Passengers */}
            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {booking.passengers.length} Passenger(s)
                </span>
              </div>
              <div className="text-sm text-slate-300">
                {booking.passengers.map((p, i) => (
                  <span key={i}>
                    {p.name} ({p.age}y, {p.gender}
                    {p.seatNumber ? `, Seat ${p.seatNumber}` : ''})
                    {i < booking.passengers.length - 1 ? ' • ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer - Fare & Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-400">Total Fare</p>
                <p className="text-2xl font-bold text-green-400">₹{booking.totalFare}</p>
              </div>

              <button
                onClick={() => generatePDF(booking)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Ticket</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
