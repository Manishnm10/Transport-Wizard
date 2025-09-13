import React, { useState, useEffect } from 'react';
import { Menu, X, Bus, Train, Plane, Clock, Users, Calendar, MapPin, Star, CreditCard, User, History, Edit, Trash2, Home, Eye, EyeOff } from 'lucide-react';

const TransportWizard = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [bookingData, setBookingData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
    transport: ''
  });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState('search'); // search, select, seats, payment, confirm

  // Mock data for routes and prices
  const routes = {
    bus: [
      { id: 1, from: 'Bangalore', to: 'Mumbai', price: 800, windowPrice: 950, duration: '12h', available: 28 },
      { id: 2, from: 'Bangalore', to: 'Chennai', price: 400, windowPrice: 480, duration: '6h', available: 35 },
      { id: 3, from: 'Mumbai', to: 'Delhi', price: 1200, windowPrice: 1400, duration: '18h', available: 15 }
    ],
    train: [
      { id: 1, from: 'Bangalore', to: 'Mumbai', price: 600, windowPrice: 720, duration: '14h', available: 45 },
      { id: 2, from: 'Bangalore', to: 'Chennai', price: 300, windowPrice: 360, duration: '5h', available: 52 },
      { id: 3, from: 'Mumbai', to: 'Delhi', price: 900, windowPrice: 1080, duration: '16h', available: 23 }
    ],
    plane: [
      { id: 1, from: 'Bangalore', to: 'Mumbai', price: 4500, windowPrice: 5200, duration: '1h 30m', available: 12 },
      { id: 2, from: 'Bangalore', to: 'Chennai', price: 3200, windowPrice: 3800, duration: '1h', available: 18 },
      { id: 3, from: 'Mumbai', to: 'Delhi', price: 5500, windowPrice: 6300, duration: '2h', available: 8 }
    ],
    metro: [
      { id: 1, from: 'MG Road', to: 'Whitefield', price: 45, windowPrice: 45, duration: '45m', available: 120 },
      { id: 2, from: 'Majestic', to: 'Airport', price: 60, windowPrice: 60, duration: '1h', available: 95 },
      { id: 3, from: 'Indiranagar', to: 'Mysore Road', price: 35, windowPrice: 35, duration: '35m', available: 140 }
    ]
  };

  const transportIcons = {
    bus: Bus,
    train: Train,
    plane: Plane,
    metro: Clock
  };

  // Seat layouts for different transports
  const getSeatLayout = (transport) => {
    const layouts = {
      bus: { rows: 12, seatsPerRow: 4, windowSeats: [0, 3] },
      train: { rows: 18, seatsPerRow: 6, windowSeats: [0, 1, 4, 5] },
      plane: { rows: 25, seatsPerRow: 6, windowSeats: [0, 5] },
      metro: { rows: 8, seatsPerRow: 8, windowSeats: [] }
    };
    return layouts[transport] || layouts.bus;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const userData = { email, name: email.split('@')[0], isNewUser: !localStorage.getItem(email) };
    
    if (isRegistering) {
      localStorage.setItem(email, 'true');
    }
    
    setUser(userData);
    setShowLogin(false);
    setIsRegistering(false);
  };

  const handleBooking = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setCurrentPage('booking');
    setCurrentStep('search');
  };

  // NEW: jump to booking with a transport preselected
  const startTransportBooking = (transport) => {
    setBookingData(prev => ({
      ...prev,
      transport,
      from: '',
      to: '',
      date: '',
      passengers: 1
    }));
    setSelectedSeats([]);
    setSelectedTransport(null);
    setCurrentStep('search');
    setCurrentPage('booking');
    if (!user) setShowLogin(true); // show login but still navigate to booking
  };

  const handleSeatSelection = (seatIndex, isWindow) => {
    if (selectedSeats.includes(seatIndex)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatIndex));
    } else if (selectedSeats.length < bookingData.passengers) {
      setSelectedSeats([...selectedSeats, seatIndex]);
    }
  };

  const calculateTotal = () => {
    if (!selectedTransport || selectedSeats.length === 0) return 0;
    
    const layout = getSeatLayout(bookingData.transport);
    const basePrice = selectedTransport.price;
    const windowPrice = selectedTransport.windowPrice;
    
    return selectedSeats.reduce((total, seatIndex) => {
      const row = Math.floor(seatIndex / layout.seatsPerRow);
      const col = seatIndex % layout.seatsPerRow;
      const isWindow = layout.windowSeats.includes(col);
      return total + (isWindow && bookingData.transport !== 'metro' ? windowPrice : basePrice);
    }, 0);
  };

  const confirmBooking = () => {
    // NEW: enforce login before confirming a booking
    if (!user) {
      setShowLogin(true);
      return;
    }

    const newBooking = {
      id: Date.now(),
      ...bookingData,
      transport: selectedTransport,
      seats: selectedSeats,
      total: calculateTotal(),
      status: 'Confirmed',
      bookingDate: new Date().toLocaleDateString()
    };
    
    setBookings([...bookings, newBooking]);
    setCurrentPage('home');
    setCurrentStep('search');
    setSelectedSeats([]);
    setSelectedTransport(null);
    setBookingData({ from: '', to: '', date: '', passengers: 1, transport: '' });
  };

  const cancelBooking = (bookingId) => {
    setBookings(bookings.filter(booking => booking.id !== bookingId));
  };

  const VehicleDiagram = ({ transport, onSeatSelect, selectedSeats, passengerCount }) => {
    const layout = getSeatLayout(transport);
    const totalSeats = layout.rows * layout.seatsPerRow;
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Select Your Seats</h3>
          <p className="text-sm text-gray-600 mt-1">
            {transport === 'plane' && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                ✈️ Max luggage: 15kg per passenger
              </span>
            )}
          </p>
          <div className="flex justify-center items-center mt-2 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded mr-2"></div>Available</div>
              <div className="flex items-center"><div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>Selected</div>
              <div className="flex items-center"><div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>Occupied</div>
              {transport !== 'metro' && <div className="flex items-center"><div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>Window (+₹)</div>}
            </div>
          </div>
        </div>
        
        {/* Direction indicator */}
        <div className="text-center mb-4 p-2 bg-gray-100 rounded">
          <span className="text-sm font-medium">🔄 Front Direction 🔄</span>
        </div>
        
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${layout.seatsPerRow}, 1fr)` }}>
          {Array.from({ length: totalSeats }).map((_, index) => {
            const row = Math.floor(index / layout.seatsPerRow);
            const col = index % layout.seatsPerRow;
            const isWindow = layout.windowSeats.includes(col);
            const isSelected = selectedSeats.includes(index);
            const isOccupied = Math.random() < 0.3; // Random occupied seats
            
            return (
              <button
                key={index}
                onClick={() => !isOccupied && handleSeatSelection(index, isWindow)}
                disabled={isOccupied || (selectedSeats.length >= passengerCount && !isSelected)}
                className={`
                  w-8 h-8 rounded text-xs font-medium transition-all duration-200 
                  ${isOccupied ? 'bg-gray-400 cursor-not-allowed' : 
                    isSelected ? 'bg-blue-500 text-white' : 
                    isWindow && transport !== 'metro' ? 'bg-yellow-400 hover:bg-yellow-500' : 
                    'bg-green-500 hover:bg-green-600 text-white'}
                `}
              >
                {row + 1}{String.fromCharCode(65 + col)}
              </button>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Selected: {selectedSeats.length} / {passengerCount} seats
          </p>
          {selectedSeats.length > 0 && (
            <p className="text-lg font-bold text-green-600 mt-2">
              Total: ₹{calculateTotal()}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Home Page
  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Marquee for new users */}
        {user?.isNewUser && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 overflow-hidden">
            <div className="animate-bounce">
              <marquee className="text-sm font-medium">🎉 Welcome! Get 20% OFF on your first booking! Use code: WELCOME20 🎉</marquee>
            </div>
          </div>
        )}
        
        <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Transport
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"> Wizard</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Your magical journey begins here. Book tickets across Bus, Train, Plane & Metro.
            </p>
            <button
              onClick={handleBooking}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transform transition duration-300 shadow-2xl hover:shadow-cyan-500/25"
            >
              🧙‍♂️ Book Tickets Now
            </button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white text-4xl">✨</div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl mr-4">🧙‍♂️</div>
              <h2 className="text-4xl font-bold text-gray-800">Transport Wizard</h2>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-6 max-w-2xl">
              {[
                { icon: '🚌', title: 'Bus', key: 'bus' },
                { icon: '🚂', title: 'Train', key: 'train' },
                { icon: '✈️', title: 'Air Travel', key: 'plane' },
                { icon: '🚇', title: 'Metro', key: 'metro' }
              ].map((feature, index) => (
                <button
                  key={index}
                  onClick={() => startTransportBooking(feature.key)}
                  aria-label={`Book ${feature.title}`}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 aspect-square flex flex-col items-center justify-center min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="text-sm font-bold text-gray-800 text-center">{feature.title}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Booking Page
  const BookingPage = () => {
    const availableRoutes = routes[bookingData.transport] || [];
    
    if (currentStep === 'search') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Book Your Journey</h2>
            
            {/* Transport Selection */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Transport Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['bus', 'train', 'plane', 'metro'].map(transport => {
                  const Icon = transportIcons[transport];
                  return (
                    <button
                      key={transport}
                      onClick={() => setBookingData({...bookingData, transport})}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        bookingData.transport === transport 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium capitalize">{transport}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Booking Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select 
                    value={bookingData.from} 
                    onChange={e => setBookingData({...bookingData, from: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select origin</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Delhi">Delhi</option>
                    {bookingData.transport === 'metro' && (
                      <>
                        <option value="MG Road">MG Road</option>
                        <option value="Majestic">Majestic</option>
                        <option value="Indiranagar">Indiranagar</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select 
                    value={bookingData.to} 
                    onChange={e => setBookingData({...bookingData, to: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select destination</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Delhi">Delhi</option>
                    {bookingData.transport === 'metro' && (
                      <>
                        <option value="Whitefield">Whitefield</option>
                        <option value="Airport">Airport</option>
                        <option value="Mysore Road">Mysore Road</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={bookingData.date}
                    onChange={e => setBookingData({...bookingData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <select 
                    value={bookingData.passengers} 
                    onChange={e => setBookingData({...bookingData, passengers: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={() => bookingData.transport && bookingData.from && bookingData.to && bookingData.date && setCurrentStep('select')}
                disabled={!bookingData.transport || !bookingData.from || !bookingData.to || !bookingData.date}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:scale-105 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Search Routes
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 'select') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Available Routes</h2>
              <button 
                onClick={() => setCurrentStep('search')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Modify Search
              </button>
            </div>
            
            <div className="space-y-4">
              {availableRoutes.map(route => (
                <div key={route.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{route.from} → {route.to}</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {route.duration}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{route.available} seats available</span>
                        <span>Regular: ₹{route.price}</span>
                        {bookingData.transport !== 'metro' && <span>Window: ₹{route.windowPrice}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedTransport(route);
                        setCurrentStep('seats');
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transform transition duration-300"
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 'seats') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Select Seats</h2>
              <button 
                onClick={() => setCurrentStep('select')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Routes
              </button>
            </div>
            
            <VehicleDiagram 
              transport={bookingData.transport}
              onSeatSelect={handleSeatSelection}
              selectedSeats={selectedSeats}
              passengerCount={bookingData.passengers}
            />
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => selectedSeats.length === bookingData.passengers && setCurrentStep('payment')}
                disabled={selectedSeats.length !== bookingData.passengers}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 'payment') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Payment Details</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Route:</span><span className="font-medium">{selectedTransport?.from} → {selectedTransport?.to}</span></div>
                  <div className="flex justify-between"><span>Date:</span><span className="font-medium">{bookingData.date}</span></div>
                  <div className="flex justify-between"><span>Transport:</span><span className="font-medium capitalize">{bookingData.transport}</span></div>
                  <div className="flex justify-between"><span>Passengers:</span><span className="font-medium">{bookingData.passengers}</span></div>
                  <div className="flex justify-between"><span>Seats:</span><span className="font-medium">{selectedSeats.join(', ')}</span></div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Total:</span><span>₹{calculateTotal()}</span>
                  </div>
                  {user?.isNewUser && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-green-700 text-sm">🎉 First booking discount applied: -20%</p>
                      <p className="text-green-700 font-medium">Final Total: ₹{Math.round(calculateTotal() * 0.8)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Information</h3>
                <form onSubmit={(e) => { e.preventDefault(); confirmBooking(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full p-3 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input type="text" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                      <input type="text" placeholder="John Doe" className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:scale-105 transform transition duration-300"
                  >
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Pay ₹{user?.isNewUser ? Math.round(calculateTotal() * 0.8) : calculateTotal()}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Booking History Page
  const BookingHistoryPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Booking History</h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start your journey by booking your first ticket!</p>
            <button 
              onClick={handleBooking}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transform transition duration-300"
            >
              Book Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {booking.transport.from} → {booking.transport.to}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Date:</span> {booking.date}</p>
                        {/* Note: booking.transport is a route object */}
                        <p><span className="font-medium">Passengers:</span> {booking.passengers}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Seats:</span> {booking.seats.join(', ')}</p>
                        <p><span className="font-medium">Total:</span> ₹{booking.total}</p>
                        <p><span className="font-medium">Booked on:</span> {booking.bookingDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setCurrentPage('modify')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modify Booking"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => cancelBooking(booking.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Cancel Booking Page
  const CancelBookingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Cancel Booking</h2>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No active bookings</h3>
            <p className="text-gray-500">You don't have any bookings to cancel.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.filter(booking => booking.status === 'Confirmed').map(booking => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {booking.transport.from} → {booking.transport.to}
                    </h3>
                    <div className="text-sm text-gray-600">
                      <p>Date: {booking.date}</p>
                      <p>Seats: {booking.seats.join(', ')} | Total: ₹{booking.total}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this booking?')) {
                        cancelBooking(booking.id);
                      }
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transform transition duration-300"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Modify Booking Page
  const ModifyBookingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Modify Booking</h2>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Modification Service</h3>
            <p className="text-gray-500 mb-6">
              Booking modifications are subject to availability and may incur additional charges.
            </p>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="text-left">
                <h4 className="font-semibold text-gray-700 mb-2">Available Modifications:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Change travel date (₹50 fee)</li>
                  <li>• Modify passenger details (₹25 fee)</li>
                  <li>• Seat upgrades (price difference applies)</li>
                  <li>• Add/remove passengers (subject to availability)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Tip:</strong> Modifications must be made at least 2 hours before departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Login Modal
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isRegistering ? 'Join Transport Wizard today' : 'Sign in to continue booking'}
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:scale-105 transform transition duration-300"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div 
                onClick={() => setCurrentPage('home')}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎫</span>
                </div>
                <span className="text-xl font-bold text-gray-800">Transport Wizard</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              
              <button 
                onClick={handleBooking}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Tickets</span>
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-700 hidden sm:block">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUser(null);
                      setCurrentPage('home');
                      setBookings([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:scale-105 transform transition duration-300"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-2xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:fixed lg:shadow-none`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🧙‍♂️</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'booking', label: 'Book Tickets', icon: Calendar },
                { id: 'history', label: 'Booking History', icon: History },
                { id: 'cancel', label: 'Cancel Booking', icon: Trash2 },
                { id: 'modify', label: 'Modify Booking', icon: Edit }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'booking') {
                        handleBooking();
                      } else {
                        setCurrentPage(item.id);
                      }
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      currentPage === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">Contact our 24/7 support team</p>
              <button className="text-blue-600 font-medium text-sm hover:text-blue-800">
                📞 1800-123-4567
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'booking' && <BookingPage />}
        {currentPage === 'history' && <BookingHistoryPage />}
        {currentPage === 'cancel' && <CancelBookingPage />}
        {currentPage === 'modify' && <ModifyBookingPage />}
      </main>

      {/* Login Modal */}
      {showLogin && <LoginModal />}
    </div>
  );
};

export default TransportWizard;
