import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaCalendar, FaArrowLeft, FaUserMd, FaExchangeAlt, FaPaw } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId');
  const preselectedDoctorName = searchParams.get('doctorName');
  const preselectedPetId = searchParams.get('petId');

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(!preselectedDoctorId);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    petId: preselectedPetId || '',
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
      setDataLoading(true);
      const [petsRes, doctorsRes] = await Promise.all([
        api.get('/api/v1/owner/pets'),
        api.get('/api/v1/search/doctors')
      ]);
      const petsList = petsRes.data?.pets || [];
      const doctorsList = doctorsRes.data?.doctors || [];
      setPets(petsList);
      setDoctors(doctorsList);

      // If we arrived from a doctor's profile page (?doctorId=...), preselect them
      if (preselectedDoctorId) {
        const match = doctorsList.find((d) => String(d.user?.id) === String(preselectedDoctorId));
        if (match) {
          handleDoctorSelect(match);
        } else {
          toast.error('That doctor is no longer available for booking');
          setShowDoctorPicker(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const doctorId = selectedDoctor.id;
      const formattedDate = selectedDate;
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
    const userId = doctor.user?.id;
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setShowDoctorPicker(false);
    setFormData((prev) => ({
      ...prev,
      doctorId: userId,
      appointmentDate: '',
      appointmentTime: ''
    }));
  };

  const toISODate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateSelect = (date) => {
    const formattedDate = toISODate(date);
    setSelectedDate(formattedDate);
    setSelectedTime('');
    setFormData({ ...formData, appointmentDate: formattedDate, appointmentTime: '' });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.petId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please complete all required fields');
      return;
    }
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
      toast.error(error.response?.data?.error || '❌ Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleMonthChange = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSelected = selectedDate === toISODate(date);
      const isAvailable = !isPast && selectedDoctor;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && isAvailable && handleDateSelect(date)}
          disabled={isPast || !isAvailable}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${isPast ? 'text-ink-300 cursor-not-allowed bg-ink-50' : ''}
            ${!isPast && !selectedDoctor ? 'text-ink-300 cursor-not-allowed' : ''}
            ${isSelected ? 'bg-primary-600 text-white shadow-glow' : ''}
            ${!isPast && !isSelected && isAvailable ? 'hover:bg-primary-100 text-ink-700 cursor-pointer' : ''}
            ${isToday && !isSelected ? 'border-2 border-primary-500' : ''}
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

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-slideUp">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/owner/appointments" className="text-ink-500 hover:text-ink-800">
          <FaArrowLeft />
        </Link>
        <h1 className="page-title mb-0">
          <FaCalendar className="text-primary-600" /> Book Appointment
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Pet *</label>
                <div className="input-icon-wrap">
                  <FaPaw className="field-icon" />
                  <select
                    value={formData.petId}
                    onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                    className="select-field pl-11"
                    required
                  >
                    <option value="">Select a pet</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor *</label>
                {selectedDoctor && !showDoctorPicker ? (
                  <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-3">
                    <span className="avatar w-10 h-10 bg-primary-100 text-primary-700 shrink-0">
                      <FaUserMd />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-800 truncate">
                        Dr. {selectedDoctor.user?.name || preselectedDoctorName}
                      </p>
                      <p className="text-xs text-ink-500 truncate">{selectedDoctor.specialisation}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDoctorPicker(true)}
                      className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <FaExchangeAlt className="text-[10px]" /> Change
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.doctorId}
                    onChange={(e) => {
                      const doctor = doctors.find((d) => String(d.user?.id) === e.target.value);
                      if (doctor) handleDoctorSelect(doctor);
                    }}
                    className="select-field"
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.user?.id}>
                        Dr. {doctor.user?.name} — {doctor.specialisation || 'General'}
                        {doctor.distanceKm != null ? ` (${doctor.distanceKm} km)` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="form-hint">
                  Prefer to browse by location? <Link to="/search-doctors" className="text-primary-600 hover:underline">Find a vet near you</Link>
                </p>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="textarea-field"
                  placeholder="Any special notes for the vet..."
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Calendar & Time Slots */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            {!selectedDoctor && (
              <div className="mb-4 p-3 bg-ink-50 rounded-xl border border-ink-200 text-center text-ink-500 text-sm">
                👆 Select a doctor first
              </div>
            )}

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button type="button" onClick={() => handleMonthChange(-1)} className="btn-icon">‹</button>
                <h3 className="font-semibold text-ink-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button type="button" onClick={() => handleMonthChange(1)} className="btn-icon">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-xs font-medium text-ink-400 py-1">{day}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="border-t border-ink-100 pt-4">
                <h4 className="text-sm font-medium text-ink-700 mb-3">
                  Available Slots for {selectedDate}
                </h4>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedTime(slot);
                          setFormData({ ...formData, appointmentTime: slot });
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${selectedTime === slot ? 'bg-primary-600 text-white shadow-glow' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'}
                        `}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-ink-400 text-sm py-4">
                    No available slots on this date
                  </p>
                )}
              </div>
            )}

            {/* Book Button */}
            {selectedDate && selectedTime && (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-4 !py-3">
                {loading ? 'Booking...' : `Book for ${selectedTime}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
