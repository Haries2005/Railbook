import React, { useState,} from 'react';
import { User, Phone, CreditCard, Plus, Minus, AlertCircle, Mail, MessageSquare } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Passenger } from '../../contexts/AppContext';
import SeatSelection from './SeatSelection';
import jsPDF from 'jspdf';

interface BookingFormProps {
  user: { id: string; name: string };
  onNavigate: (page: string) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onNavigate }) => {


  const { selectedTrain, selectedClass, journeyDate, selectedSeats, createBooking } = useApp();
  const [formData, setFormData] = useState({
    mobileNumber: '',
    email: ''
  });
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: '', age: 0, gender: 'male', aadharNumber: '', berth: 'lower' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  if (!selectedTrain || !selectedClass) {
    onNavigate('search');
    return null;
  }
const selectedClassInfo = selectedTrain.classes.find(c => c.class_name === selectedClass);
const totalFare = (selectedClassInfo?.fare || 0) * passengers.length;
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        newErrors[`passenger_${index}_name`] = 'Passenger name is required';
      }
      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        newErrors[`passenger_${index}_age`] = 'Valid age is required (1-120)';
      }
      if (!passenger.aadharNumber) {
        newErrors[`passenger_${index}_aadhar`] = 'Aadhar number is required';
      } else if (!/^\d{12}$/.test(passenger.aadharNumber)) {
        newErrors[`passenger_${index}_aadhar`] = 'Aadhar number must be 12 digits';
      }
    });

    if (selectedSeats.length !== passengers.length) {
      newErrors.seats = 'Please select seats for all passengers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const deriveAgeFromAadhar = (aadhar: string): number => {
    if (aadhar.length !== 12) return 0;
    
    // Mock logic: Use first two digits to derive birth year
    const firstTwoDigits = parseInt(aadhar.substring(0, 2));
    const currentYear = new Date().getFullYear();
    
    // Assume birth year based on first two digits
    let birthYear = 1900 + firstTwoDigits;
    if (birthYear > currentYear) {
      birthYear = 1900 + firstTwoDigits - 100; // Handle century rollover
    }
    
    const age = currentYear - birthYear;
    return Math.max(1, Math.min(120, age)); // Ensure age is between 1 and 120
  };

  const suggestBerth = (age: number, gender: 'male' | 'female'): Passenger['berth'] => {
    if (age >= 60) return 'lower';
    if (gender === 'female' && age >= 45) return 'lower';
    if (age >= 35) return 'middle';
    return 'upper';
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string | number) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };

    // Auto-derive age from Aadhar number
    if (field === 'aadharNumber' && typeof value === 'string' && value.length === 12) {
      const derivedAge = deriveAgeFromAadhar(value);
      updatedPassengers[index].age = derivedAge;
      updatedPassengers[index].berth = suggestBerth(derivedAge, updatedPassengers[index].gender);
    }

    // Auto-suggest berth when age or gender changes
    if (field === 'age' || field === 'gender') {
      const age = field === 'age' ? (value as number) : updatedPassengers[index].age;
      const gender = field === 'gender' ? (value as 'male' | 'female') : updatedPassengers[index].gender;
      updatedPassengers[index].berth = suggestBerth(age, gender);
    }

    setPassengers(updatedPassengers);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', age: 0, gender: 'male', aadharNumber: '', berth: 'lower' }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const sendNotifications = async (booking: any) => {
    // Mock email sending
    console.log('Sending email to:', formData.email);
    console.log('Email content:', {
      subject: `Booking Confirmation - PNR: ${booking.pnr}`,
      body: `Your train ticket has been booked successfully. PNR: ${booking.pnr}`
    });

    // Mock SMS sending
    console.log('Sending SMS to:', formData.mobileNumber);
    console.log('SMS content:', `Railbook: Your ticket is confirmed. PNR: ${booking.pnr}. Journey: ${booking.trainName} on ${booking.journeyDate}. Happy Journey!`);
  };

  const generatePDF = (booking: any) => {
    const doc = new jsPDF();
    
    // Professional Header Design
    doc.setFillColor(15, 23, 42); // Dark slate background
    doc.rect(0, 0, 210, 35, 'F');
    
    // Gradient effect with multiple rectangles
    doc.setFillColor(59, 130, 246, 0.8);
    doc.rect(0, 0, 210, 8, 'F');
    doc.setFillColor(147, 51, 234, 0.6);
    doc.rect(0, 8, 210, 8, 'F');
    doc.setFillColor(59, 130, 246, 0.4);
    doc.rect(0, 16, 210, 8, 'F');
    
    // Company Logo and Branding
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RAILBOOK', 20, 22);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Your Premium Journey Companion', 20, 28);
    
    // Ticket Type
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('E-TICKET', 160, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Electronic Reservation Slip', 160, 28);
    
    // Main ticket border with rounded corners effect
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(1);
    doc.rect(15, 40, 180, 210, 'S');
    
    // Inner border for premium look
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(18, 43, 174, 204, 'S');
    
    // PNR Section
    doc.setFillColor(239, 246, 255);
    doc.rect(20, 48, 170, 22, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.rect(20, 48, 170, 22, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`PNR: ${booking.pnr}`, 25, 62);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Booking Date: ${booking.bookingDate.toLocaleDateString()}`, 25, 67);
    doc.text(`Journey Date: ${booking.journeyDate}`, 130, 67);
    
    // Train Details Section
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('TRAIN DETAILS', 25, 85);
    
    // Section separator line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(25, 88, 185, 88);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const trainDetails = [
      ['Train Name:', booking.trainName],
      ['Train Number:', booking.trainNumber],
      ['Class:', booking.selectedClass],
      ['From Station:', booking.source],
      ['To Station:', booking.destination],
      ['Departure Time:', booking.departureTime],
      ['Arrival Time:', booking.arrivalTime]
    ];
    
    let yPos = 95;
    trainDetails.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(label, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(value, 85, yPos);
      yPos += 7;
    });
    
    // Passenger Details Section
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PASSENGER DETAILS', 25, yPos + 15);
    
    doc.setDrawColor(59, 130, 246);
    doc.line(25, yPos + 18, 185, yPos + 18);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    
    yPos += 28;
    doc.text('S.No', 25, yPos);
    doc.text('Passenger Name', 40, yPos);
    doc.text('Age', 110, yPos);
    doc.text('Gender', 130, yPos);
    doc.text('Seat', 155, yPos);
    doc.text('Berth', 175, yPos);
    
    // Draw line under headers
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);
    doc.line(25, yPos + 2, 185, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    
    booking.passengers.forEach((passenger: any, index: number) => {
      doc.setFontSize(9);
      doc.text(`${index + 1}`, 25, yPos);
      doc.text(passenger.name, 40, yPos);
      doc.text(`${passenger.age}`, 110, yPos);
      doc.text(passenger.gender.toUpperCase(), 130, yPos);
      doc.text(passenger.seatNumber || selectedSeats[index] || 'N/A', 155, yPos);
      doc.text(passenger.berth.toUpperCase(), 175, yPos);
      yPos += 7;
    });
    
    // Contact Details Section
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('CONTACT INFORMATION', 25, yPos + 15);
    
    doc.setDrawColor(59, 130, 246);
    doc.line(25, yPos + 18, 185, yPos + 18);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    yPos += 28;
    doc.text(`Mobile: ${formData.mobileNumber}`, 25, yPos);
    doc.text(`Email: ${formData.email}`, 25, yPos + 8);
    
    // Fare Details with premium styling
    doc.setFillColor(16, 185, 129);
    doc.rect(20, yPos + 18, 170, 28, 'F');
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(1);
    doc.rect(20, yPos + 18, 170, 28, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL FARE: Rs.${booking.totalFare}/-`, 25, yPos + 35);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`(Including all taxes and fees)`, 25, yPos + 41);
    
    // Status Badge
    doc.setFillColor(34, 197, 94);
    doc.rect(140, yPos + 25, 45, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIRMED', 145, yPos + 33);
    
    // Important Notes
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTANT:', 25, yPos + 58);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('• Please carry a valid photo ID proof during journey', 25, yPos + 65);
    doc.text('• Report at the station 30 minutes before departure', 25, yPos + 70);
    doc.text('• This is a computer generated ticket and does not require signature', 25, yPos + 75);
    
    // Footer with company branding
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos + 82, 170, 20, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(20, yPos + 82, 170, 20, 'S');
    
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing RAILBOOK!', 105, yPos + 92, { align: 'center' });
    
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('24/7 Support: support@railbook.com | +91-1800-RAILBOOK', 105, yPos + 97, { align: 'center' });
    
    doc.save(`railbook-ticket-${booking.pnr}.pdf`);
  };

  const generatePDFOld = (booking: any) => {
    const doc = new jsPDF();
    
    // Header (old version)
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('RAILBOOK TICKET', 105, 20, { align: 'center' });
    
    // PNR
    doc.setFontSize(16);
    doc.text(`PNR: ${booking.pnr}`, 20, 40);
    
    // Train Details
    doc.setFontSize(12);
    doc.text(`Train: ${booking.trainName} (${booking.trainNumber})`, 20, 55);
    doc.text(`From: ${booking.source}`, 20, 70);
    doc.text(`To: ${booking.destination}`, 20, 85);
    doc.text(`Departure: ${booking.departureTime}`, 20, 100);
    doc.text(`Arrival: ${booking.arrivalTime}`, 20, 115);
    doc.text(`Class: ${booking.selectedClass}`, 20, 130);
    
    // Passenger Details
    doc.text('Passengers:', 20, 150);
    let yPos = 165;
    booking.passengers.forEach((passenger: Passenger, index: number) => {
      doc.text(`${index + 1}. ${passenger.name} (${passenger.age}y, ${passenger.gender}, ${passenger.berth} berth)`, 25, yPos);
      yPos += 15;
    });
    
    // Contact Details
    doc.text(`Mobile: ${booking.mobileNumber}`, 20, yPos + 10);
    doc.text(`Aadhar: ${booking.aadharNumber}`, 20, yPos + 25);
    
    // Fare
    doc.text(`Total Fare: ₹${booking.totalFare}`, 20, yPos + 45);
    
    // Footer
    doc.text('Happy Journey!', 105, yPos + 65, { align: 'center' });
    
    doc.save(`railbook-ticket-${booking.pnr}.pdf`);
  };

// Add this at the beginning of handleSubmit, right after the seat validation

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  console.log('🔍 DEBUG - Current selectedSeats:', selectedSeats);
  console.log('🔍 DEBUG - Current passengers:', passengers);
  console.log('🔍 DEBUG - Selected Train:', selectedTrain);
  console.log('🔍 DEBUG - Train ID check:', {
    _id: selectedTrain._id,
    id: selectedTrain.id,
    fullObject: JSON.stringify(selectedTrain, null, 2)
  });

  // CRITICAL CHECK: Verify seats are selected
  if (selectedSeats.length === 0) {
    setErrors({ seats: 'Please select seats before booking' });
    return;
  }

  if (selectedSeats.length !== passengers.length) {
    setErrors({ seats: `Please select ${passengers.length} seat(s)` });
    return;
  }

  // CRITICAL CHECK: Verify train has an ID
  const trainId = selectedTrain._id || selectedTrain.id;
  if (!trainId) {
    console.error('❌ No train ID found!', selectedTrain);
    setErrors({ general: 'Invalid train selection. Please go back and select a train again.' });
    return;
  }

  setIsLoading(true);
  
  try {
    // IMPORTANT: Create new array with seat assignments
    const passengersWithSeats = passengers.map((passenger, index) => {
      const seatNum = selectedSeats[index];
      console.log(`🎫 Assigning seat "${seatNum}" to passenger ${index + 1}: ${passenger.name}`);
      
      return {
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        aadharNumber: passenger.aadharNumber,
        berth: passenger.berth,
        seatNumber: seatNum
      };
    });

    console.log('👥 Final passengers array:', JSON.stringify(passengersWithSeats, null, 2));

    const bookingData = {
      trainId: trainId, // Use the verified trainId
      trainNumber: selectedTrain.train_number,
      trainName: selectedTrain.train_name,
      source: selectedTrain.source_station,
      destination: selectedTrain.destination_station,
      journeyDate,
      departureTime: selectedTrain.departure_time,
      arrivalTime: selectedTrain.arrival_time,
      selectedClass,
      passengers: passengersWithSeats,
      mobileNumber: formData.mobileNumber,
      totalFare,
    };

    console.log('📦 FINAL booking data:', JSON.stringify(bookingData, null, 2));

    const booking = await createBooking(bookingData);

    console.log('✅ Booking successful:', booking);

    // Send notifications
    await sendNotifications(booking);

    // Generate PDF
    generatePDF(booking);

    // Show success
    alert(`Booking successful! PNR: ${booking.pnr}\nTicket PDF has been downloaded.\nConfirmation sent to your email and mobile.`);
    onNavigate('search');
  } catch (error: any) {
    console.error('❌ Booking error:', error);
    setErrors({ general: error.message || 'Booking failed. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};

  const handleSeatsSelected = (seats: string[]) => {
    // Seats are automatically updated through context
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-slate-400">Fill in passenger details to book your train ticket</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}

              {/* Contact Details */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.mobileNumber ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.mobileNumber && <p className="mt-1 text-sm text-red-400">{errors.mobileNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-slate-600'
                        }`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Passenger Details</h2>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Passenger</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Passenger {index + 1}</h3>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input
                              type="text"
                              value={passenger.name}
                              onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                              className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors[`passenger_${index}_name`] ? 'border-red-500' : 'border-slate-600'
                              }`}
                              placeholder="Enter full name"
                            />
                          </div>
                          {errors[`passenger_${index}_name`] && (
                            <p className="mt-1 text-sm text-red-400">{errors[`passenger_${index}_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Age
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={passenger.age || ''}
                            onChange={(e) => handlePassengerChange(index, 'age', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`passenger_${index}_age`] ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="Age"
                          />
                          {errors[`passenger_${index}_age`] && (
                            <p className="mt-1 text-sm text-red-400">{errors[`passenger_${index}_age`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Gender
                          </label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Aadhar Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            value={passenger.aadharNumber}
                            onChange={(e) => handlePassengerChange(index, 'aadharNumber', e.target.value)}
                            className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`passenger_${index}_aadhar`] ? 'border-red-500' : 'border-slate-600'
                            }`}
                            placeholder="12-digit Aadhar number"
                            maxLength={12}
                          />
                        </div>
                        {errors[`passenger_${index}_aadhar`] && (
                          <p className="mt-1 text-sm text-red-400">{errors[`passenger_${index}_aadhar`]}</p>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Berth Preference (Auto-suggested)
                        </label>
                        <select
                          value={passenger.berth}
                          onChange={(e) => handlePassengerChange(index, 'berth', e.target.value)}
                          className="w-full px-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="lower">Lower</option>
                          <option value="middle">Middle</option>
                          <option value="upper">Upper</option>
                          <option value="side-lower">Side Lower</option>
                          <option value="side-upper">Side Upper</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {passengers.some(p => p.aadharNumber.length === 12) && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                      Age and berth preference have been auto-suggested based on Aadhar numbers. You can modify them if needed.
                    </div>
                  </div>
                )}
              </div>

              {/* Seat Selection */}
              <SeatSelection 
                onSeatsSelected={handleSeatsSelected}
                requiredSeats={passengers.length}
              />
              {errors.seats && <p className="text-sm text-red-400 mt-2">{errors.seats}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || selectedSeats.length !== passengers.length}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing Booking...
                  </div>
                ) : (
                  'Confirm Booking & Generate Ticket'
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Train</span>
                  <span className="text-white font-medium">{selectedTrain.train_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route</span>
                  <span className="text-white text-sm">{selectedTrain.source_station} → {selectedTrain.destination_station}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Journey Date</span>
                  <span className="text-white font-medium">{journeyDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Class</span>
                  <span className="text-white font-medium">{selectedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Passengers</span>
                  <span className="text-white font-medium">{passengers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Price per ticket</span>
                  <span className="text-white font-medium">₹{selectedClassInfo?.fare}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Seats</span>
                    <span className="text-white font-medium">{selectedSeats.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-600 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Fare</span>
                  <span className="text-2xl font-bold text-green-400">₹{totalFare}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;