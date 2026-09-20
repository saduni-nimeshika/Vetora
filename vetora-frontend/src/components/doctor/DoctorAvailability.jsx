import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaSave, FaChevronLeft, FaChevronRight, FaBan, FaCalendarCheck, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Build a YYYY-MM-DD string from local date parts — avoids UTC shift from toISOString()
const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const DoctorAvailability = () => {
  const { user } = useAuth();

  // ===== Weekly pattern =====
  const [loading, setLoading] = useState(false);
  const [patternLoading, setPatternLoading] = useState(true);
  const [availability, setAvailability] = useState({
    availableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30
  });

  useEffect(() => {
    fetchMyPattern();
  }, []);

  const fetchMyPattern = async () => {
    try {
      setPatternLoading(true);
      const res = await api.get('/api/v1/doctor/availability/my-pattern');
      const p = res.data || {};
      setAvailability({
        availableDays: p.availableDays ? p.availableDays.split(',').filter(Boolean) : ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        startTime: p.startTime || '09:00',
        endTime: p.endTime || '17:00',
        slotDuration: p.slotDuration || 30,
      });
    } catch (error) {
      // No saved pattern yet — keep the sensible defaults
    } finally {
      setPatternLoading(false);
    }
  };

  const handleToggleDay = (day) => {
    setAvailability(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        availableDays: availability.availableDays.join(','),
        startTime: availability.startTime,
        endTime: availability.endTime,
        slotDuration: availability.slotDuration
      };
      await api.put('/api/v1/doctor/availability', data);
      toast.success('Availability saved successfully!');
      fetchMonthAvailability();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized. Please login as Doctor.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save availability');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Month calendar (specific-date exceptions) =====
  const [viewDate, setViewDate] = useState(startOfMonth(new Date()));
  const [monthData, setMonthData] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [exceptionMode, setExceptionMode] = useState('unavailable'); // 'unavailable' | 'special'
  const [exceptionForm, setExceptionForm] = useState({ reason: '', startTime: '09:00', endTime: '17:00' });
  const [savingException, setSavingException] = useState(false);

  const fetchMonthAvailability = useCallback(async () => {
    try {
      setCalendarLoading(true);
      const start = toISODate(startOfMonth(viewDate));
      const end = toISODate(endOfMonth(viewDate));
      const res = await api.get(`/api/v1/doctor/availability/my-availability?startDate=${start}&endDate=${end}`);
      setMonthData(res.data?.availability || {});
    } catch (error) {
      toast.error('Failed to load calendar');
    } finally {
      setCalendarLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    fetchMonthAvailability();
  }, [fetchMonthAvailability]);

  const todayISO = toISODate(new Date());

  const changeMonth = (delta) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDate(null);
  };

  const openException = (dateISO, mode) => {
    if (dateISO < todayISO) return;
    setSelectedDate(dateISO);
    setExceptionMode(mode);
    setExceptionForm({ reason: '', startTime: availability.startTime, endTime: availability.endTime });
  };

  const submitException = async () => {
    if (!selectedDate) return;
    setSavingException(true);
    try {
      if (exceptionMode === 'unavailable') {
        await api.post('/api/v1/doctor/availability/unavailable', {
          date: selectedDate,
          reason: exceptionForm.reason || 'Unavailable',
        });
        toast.success('Marked as unavailable');
      } else {
        await api.post('/api/v1/doctor/availability/special-available', {
          date: selectedDate,
          startTime: exceptionForm.startTime,
          endTime: exceptionForm.endTime,
        });
        toast.success('Special hours added');
      }
      setSelectedDate(null);
      fetchMonthAvailability();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save');
    } finally {
      setSavingException(false);
    }
  };

  // Build calendar grid cells (Monday-start week, padded with leading/trailing blanks)
  const buildCalendarCells = () => {
    const first = startOfMonth(viewDate);
    const last = endOfMonth(viewDate);
    const leadingBlanks = (first.getDay() + 6) % 7; // convert Sun=0..Sat=6 to Mon-start index
    const cells = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return cells;
  };

  const cellStyle = (dateISO, dayInfo, isPast) => {
    if (isPast) return 'bg-ink-50 text-ink-300 cursor-not-allowed';
    if (!dayInfo) return 'bg-white text-ink-600 hover:bg-ink-50 border-ink-100';
    if (dayInfo.available && dayInfo.isSpecial) return 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100';
    if (dayInfo.available) return 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100';
    return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100';
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="page-title mb-1">
          <FaClock className="text-primary-600" />
          Set Your Availability
        </h1>
        <p className="page-subtitle">Set your weekly working pattern, then fine-tune specific dates below</p>
      </motion.div>

      {/* ===== Weekly Pattern ===== */}
      <motion.div variants={itemVariants} className="card relative">
        {patternLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
            <div className="spinner w-8 h-8" />
          </div>
        )}
        <h2 className="section-title">Weekly Pattern</h2>
        <div className="mb-6">
          <label className="form-label">Available Days</label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleDay(day)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  availability.availableDays.includes(day)
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {day}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="form-group mb-0">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              value={availability.startTime}
              onChange={(e) => setAvailability({...availability, startTime: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="form-group mb-0">
            <label className="form-label">End Time</label>
            <input
              type="time"
              value={availability.endTime}
              onChange={(e) => setAvailability({...availability, endTime: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Slot Duration (minutes)</label>
          <select
            value={availability.slotDuration}
            onChange={(e) => setAvailability({...availability, slotDuration: parseInt(e.target.value)})}
            className="select-field"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="btn-primary w-full"
        >
          <FaSave />
          {loading ? 'Saving...' : 'Save Weekly Pattern'}
        </motion.button>
      </motion.div>

      {/* ===== Month Calendar for date-specific exceptions ===== */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Specific Dates</h2>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => changeMonth(-1)} className="btn-icon"><FaChevronLeft /></motion.button>
            <AnimatePresence mode="wait">
              <motion.span
                key={viewDate.toISOString()}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-ink-800 w-36 text-center"
              >
                {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </motion.span>
            </AnimatePresence>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => changeMonth(1)} className="btn-icon"><FaChevronRight /></motion.button>
          </div>
        </div>

        <p className="text-sm text-ink-500 mb-4">
          Mark a leave day off, or open up a normally-off day with special hours (e.g. a holiday clinic).
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-100 border border-primary-300 inline-block" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Unavailable</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Special hours</span>
        </div>

        {calendarLoading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-8 h-8" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-ink-400 py-1">{d}</div>
              ))}
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.012 } } }}
              className="grid grid-cols-7 gap-1.5"
            >
              {buildCalendarCells().map((date, idx) => {
                if (!date) return <div key={`blank-${idx}`} />;
                const dateISO = toISODate(date);
                const dayInfo = monthData[dateISO];
                const isPast = dateISO < todayISO;
                const isToday = dateISO === todayISO;
                return (
                  <motion.button
                    key={dateISO}
                    variants={itemVariants}
                    whileHover={!isPast ? { scale: 1.08 } : {}}
                    whileTap={!isPast ? { scale: 0.94 } : {}}
                    disabled={isPast}
                    onClick={() => setSelectedDate(selectedDate === dateISO ? null : dateISO)}
                    className={`relative aspect-square rounded-lg border text-sm font-medium transition-colors flex items-center justify-center ${cellStyle(dateISO, dayInfo, isPast)} ${selectedDate === dateISO ? 'ring-2 ring-primary-500' : ''} ${isToday ? 'font-bold' : ''}`}
                    title={dayInfo?.reason || (dayInfo?.available ? 'Available' : '')}
                  >
                    {date.getDate()}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}

        {/* Inline action panel for the selected date */}
        <AnimatePresence>
          {selectedDate && selectedDate >= todayISO && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-ink-50 rounded-xl border border-ink-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink-800">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <button onClick={() => setSelectedDate(null)} className="btn-icon !w-8 !h-8"><FaTimes /></button>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setExceptionMode('unavailable')}
                    className={exceptionMode === 'unavailable' ? 'btn-danger btn-sm' : 'btn-ghost btn-sm border border-ink-200'}
                  >
                    <FaBan /> Mark Unavailable
                  </button>
                  <button
                    onClick={() => setExceptionMode('special')}
                    className={exceptionMode === 'special' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm border border-ink-200'}
                  >
                    <FaCalendarCheck /> Special Hours
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {exceptionMode === 'unavailable' ? (
                    <motion.div
                      key="unavailable"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="form-group"
                    >
                      <label className="form-label">Reason (optional)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. On leave, Conference"
                        value={exceptionForm.reason}
                        onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="special"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div className="form-group mb-0">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="input-field"
                          value={exceptionForm.startTime}
                          onChange={(e) => setExceptionForm({ ...exceptionForm, startTime: e.target.value })}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="input-field"
                          value={exceptionForm.endTime}
                          onChange={(e) => setExceptionForm({ ...exceptionForm, endTime: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitException}
                  disabled={savingException}
                  className="btn-primary w-full mt-4"
                >
                  {savingException ? 'Saving...' : 'Confirm'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default DoctorAvailability;

