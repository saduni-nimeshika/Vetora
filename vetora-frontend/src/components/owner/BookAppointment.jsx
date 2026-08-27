import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendar, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    petId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [petsRes, doctorsRes] = await Promise.all([
        api.get('/api/v1/owner/pets'),
        api.get('/api/v1/search/doctors')
      ]);
      setPets(petsRes.data?.pets || []);
      setDoctors(doctorsRes.data?.doctors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const doctorId = selectedDoctor.id;
      const formattedDate = selectedDate;
      
      console.log('📤 Doctor ID:', doctorId);
      console.log('📤 Date:', formattedDate);
      
      const url = `/api/v1/doctor/availability/${doctorId}?startDate=${formattedDate}&endDate=${formattedDate}`;
      
      const response = await api.get(url);
      
      const availability = response.data?.availability || {};
      const dayData = availability[formattedDate];
      
      if (dayData?.available && dayData?.slots) {
        setAvailableSlots(dayData.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    const doctorProfileId = doctor.id;
    const userId = doctor.user?.id;
    
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setFormData({ 
      ...formData, 
      doctorId: userId,
      appointmentDate: '',
      appointmentTime: ''
    });
  };

  const handleDateSelect = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setSelectedTime('');
    setFormData({ ...formData, appointmentDate: formattedDate, appointmentTime: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        petId: parseInt(formData.petId),
        doctorId: parseInt(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        notes: formData.notes || ''
      };

      await api.post('/api/v1/owner/appointments', data);
      
      toast.success('✅ Appointment booked successfully!');
      navigate('/owner/appointments');
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALENDAR FUNCTIONS - FIXED!
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // ✅ RENDER CALENDAR - FIXED!
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const days = [];
    
    // Empty cells for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSelected = selectedDate === date.toISOString().split('T')[0];
      const isAvailable = !isPast && selectedDoctor;

      days.push(
        <button
          key={day}
          onClick={() => !isPast && isAvailable && handleDateSelect(date)}
          disabled={isPast || !isAvailable || !selectedDoctor}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${isPast ? 'text-gray-300 cursor-not-allowed bg-gray-100' : ''}
            ${!isPast && !selectedDoctor ? 'text-gray-400 cursor-not-allowed' : ''}
            ${isSelected ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : ''}
            ${!isPast && !isSelected && isAvailable ? 'hover:bg-emerald-100 text-gray-700 cursor-pointer' : ''}
            ${!isPast && !isSelected && !isAvailable && selectedDoctor ? 'text-gray-300 cursor-not-allowed' : ''}
            ${isToday && !isSelected ? 'border-2 border-emerald-500' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/owner/appointments" className="text-gray-600 hover:text-gray-800">
          <FaArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCalendar className="text-emerald-600" />
          Book Appointment
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Pet *</label>
                <select
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => {
                    const doctor = doctors.find(d => d.id === parseInt(e.target.value));
                    if (doctor) handleDoctorSelect(doctor);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user?.name || doctor.name} - {doctor.specialisation || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Any special notes..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Calendar & Time Slots */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
            {selectedDoctor ? (
              <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium">
                  ✅ Dr. {selectedDoctor.user?.name || selectedDoctor.name}
                </p>
                <p className="text-xs text-emerald-600">{selectedDoctor.specialisation}</p>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
                👆 Select a doctor first
              </div>
            )}

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-600"
                >
                  ‹
                </button>
                <h3 className="font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition text-gray-600"
                >
                  ›
                </button>
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Available Slots for {selectedDate}
                </h4>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => {
                          setSelectedTime(slot);
                          setFormData({ ...formData, appointmentTime: slot });
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${selectedTime === slot ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                        `}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No available slots on this date
                  </p>
                )}
              </div>
            )}

            {/* Book Button */}
            {selectedDate && selectedTime && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? '⏳ Booking...' : `📅 Book for ${selectedTime}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;