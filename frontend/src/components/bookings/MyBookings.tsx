import React from 'react';
import { Calendar, Clock, MapPin, Download, Eye, Train, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';

interface MyBookingsProps {
  onNavigate: (page: string) => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate }) => {
  const { bookings } = useApp();
  const { user } = useAuth();

  const generatePDF = (booking: any) => {
    const doc = new jsPDF();
    
    // Header with gradient-like effect using rectangles
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFillColor(147, 51, 234); // Purple
    doc.rect(140, 0, 70, 30, 'F');
    
    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RAILBOOK', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Journey Companion', 20, 26);
    
    // Ticket border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(10, 35, 190, 220);
    
    // PNR Section
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 40, 180, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`PNR: ${booking.pnr}`, 20, 52);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Booking Date: ${booking.bookingDate.toLocaleDateString()}`, 140, 52);
    
    // Train Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('TRAIN DETAILS', 20, 75);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const trainDetails = [
      [`Train Name:`, booking.trainName],
      [`Train Number:`, booking.trainNumber],
      [`Journey Date:`, booking.journeyDate],
      [`Class:`, booking.selectedClass],
      [`From:`, booking.source],
      [`To:`, booking.destination],
      [`Departure:`, booking.departureTime],
      [`Arrival:`, booking.arrivalTime]
    ];
    
    let yPos = 85;
    trainDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 70, yPos);
      yPos += 8;
    });
    
    // Passenger Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PASSENGER DETAILS', 20, yPos + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    yPos += 25;
    doc.text('S.No', 20, yPos);
    doc.text('Name', 35, yPos);
    doc.text('Age', 100, yPos);
    doc.text('Gender', 120, yPos);
    doc.text('Berth Pref.', 150, yPos);
    
    // Draw line under headers
    doc.setDrawColor(203, 213, 225);
    doc.line(20, yPos + 2, 180, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    booking.passengers.forEach((passenger: any, index: number) => {
      doc.text(`${index + 1}`, 20, yPos);
      doc.text(passenger.name, 35, yPos);
      doc.text(`${passenger.age}`, 100, yPos);
      doc.text(passenger.gender, 120, yPos);
      doc.text(passenger.berth, 150, yPos);
      yPos += 8;
    });
    
    // Contact Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('CONTACT DETAILS', 20, yPos + 15);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    yPos += 30;
    doc.text(`Mobile: ${booking.mobileNumber}`, 20, yPos);
    
    // Fare Details
    doc.setFillColor(34, 197, 94);
    doc.rect(15, yPos + 20, 180, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fare: ₹${booking.totalFare}`, 20, yPos + 35);
    
    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing Railbook. Have a safe journey!', 105, 245, { align: 'center' });
    doc.text('For support, contact: support@railbook.com', 105, 252, { align: 'center' });
    
    doc.save(`railbook-ticket-${booking.pnr}.pdf`);
  };

  const getStatusColor = (bookingDate: Date) => {
    const now = new Date();
    const diffTime = bookingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-gray-600 text-gray-200';
    if (diffDays <= 1) return 'bg-orange-600 text-white';
    return 'bg-green-600 text-white';
  };

  const getStatusText = (bookingDate: Date) => {
    const now = new Date();
    const diffTime = bookingDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Completed';
    if (diffDays <= 1) return 'Upcoming';
    return 'Confirmed';
  };

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Bookings Found</h2>
            <p className="text-slate-400 mb-8">
              You haven't made any train bookings yet. Start by searching for trains and booking your journey.
            </p>
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all"
            >
              Search Trains
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-slate-400">
            Manage your train bookings and download tickets
          </p>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all">
              {/* Booking Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
                    <Train className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{booking.trainName}</h2>
                    <p className="text-slate-400">PNR: {booking.pnr} • #{booking.trainNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.bookingDate)}`}>
                    {getStatusText(booking.bookingDate)}
                  </span>
                </div>
              </div>

              {/* Route and Timing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">From</p>
                    <p className="font-medium text-white">{booking.source}</p>
                    <p className="text-sm text-slate-300">{booking.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <div className="h-px w-8 bg-slate-600"></div>
                    <Train className="h-4 w-4" />
                    <div className="h-px w-8 bg-slate-600"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">To</p>
                    <p className="font-medium text-white">{booking.destination}</p>
                    <p className="text-sm text-slate-300">{booking.arrivalTime}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Class</p>
                  <p className="font-semibold text-white">{booking.selectedClass}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Passengers</p>
                  <p className="font-semibold text-white flex items-center justify-center">
                    <Users className="h-4 w-4 mr-1" />
                    {booking.passengers.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Booking Date</p>
                  <p className="font-semibold text-white">{booking.bookingDate.toLocaleDateString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">Total Fare</p>
                  <p className="font-semibold text-green-400">₹{booking.totalFare}</p>
                </div>
              </div>

              {/* Passenger List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Passengers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {booking.passengers.map((passenger, index) => (
                    <div key={index} className="bg-slate-700 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{passenger.name}</p>
                          <p className="text-sm text-slate-400">
                            {passenger.age} years • {passenger.gender} • {passenger.berth} berth
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => generatePDF(booking)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Ticket</span>
                </button>
                <button
                  onClick={() => generatePDF(booking)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-all"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Ticket</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{bookings.length}</div>
            <div className="text-slate-400">Total Bookings</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ₹{bookings.reduce((sum, booking) => sum + booking.totalFare, 0)}
            </div>
            <div className="text-slate-400">Total Spent</div>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {bookings.reduce((sum, booking) => sum + booking.passengers.length, 0)}
            </div>
            <div className="text-slate-400">Total Passengers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;