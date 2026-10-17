import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock } from 'react-icons/fa';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const pad = (n) => String(n).padStart(2, '0');
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Compact month calendar showing which dates a doctor is available /
 * unavailable. Calendar on the left, details on the right, so the owner
 * doesn't have to scroll through a huge grid.
 * `doctorId` is the Doctor entity id (same id the booking page uses).
 */
const DoctorAvailabilityCalendar = ({ doctorId }) => {
  const today = new Date();
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [availability, setAvailability] = useState({});
  const [weeklyInfo, setWeeklyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const start = toKey(view.year, view.month, 1);
        const end = toKey(view.year, view.month, daysInMonth);
        const res = await api.get(`/api/v1/doctor/availability/${doctorId}?startDate=${start}&endDate=${end}`);
        setAvailability(res.data?.availability || {});
        setWeeklyInfo({
          startTime: res.data?.startTime,
          endTime: res.data?.endTime,
          days: res.data?.availableDays,
        });
      } catch (e) {
        setAvailability({});
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) load();
  }, [doctorId, view.year, view.month, daysInMonth]);

  const goMonth = (delta) => {
    setSelectedKey(null);
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const cells = useMemo(() => {
    const list = [];
    for (let i = 0; i < firstWeekday; i += 1) list.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) list.push(d);
    return list;
  }, [firstWeekday, daysInMonth]);

  // How many upcoming days this month the doctor can be booked
  const openDaysLeft = useMemo(
    () => Object.entries(availability).filter(([key, v]) => key >= todayKey && v?.available).length,
    [availability, todayKey]
  );

  const selected = selectedKey ? availability[selectedKey] : null;

  return (
    <div className="mt-5 border-t border-ink-100 pt-5">
      <h3 className="text-sm font-semibold text-ink-700 flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-primary-600" /> Availability Calendar
      </h3>

      <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start">
        {/* ---- Compact calendar ---- */}
        <div className="w-full max-w-[300px]">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="w-7 h-7 rounded-lg hover:bg-ink-100 text-ink-500 flex items-center justify-center"
              aria-label="Previous month"
            >
              <FaChevronLeft className="text-[10px]" />
            </button>
            <span className="text-sm font-semibold text-ink-800">{monthLabel}</span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="w-7 h-7 rounded-lg hover:bg-ink-100 text-ink-500 flex items-center justify-center"
              aria-label="Next month"
            >
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div key={`${w}-${i}`} className="text-center text-[10px] font-semibold text-ink-400">{w}</div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-1 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;
              const key = toKey(view.year, view.month, day);
              const info = availability[key];
              const isPast = key < todayKey;
              const isToday = key === todayKey;
              const isAvailable = info?.available === true;
              const isSelected = selectedKey === key;

              let style = 'bg-ink-50 text-ink-300';
              if (!isPast && info) {
                style = isAvailable
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-red-50 text-red-400 hover:bg-red-100';
              }

              return (
                <button
                  type="button"
                  key={key}
                  disabled={isPast || !info}
                  onClick={() => setSelectedKey(isSelected ? null : key)}
                  title={!isPast && info ? (isAvailable ? 'Available' : info.reason || 'Unavailable') : ''}
                  className={`h-9 rounded-md text-xs font-semibold flex items-center justify-center transition-colors
                    ${style}
                    ${isToday ? 'ring-2 ring-primary-500' : ''}
                    ${isSelected ? 'ring-2 ring-ink-700' : ''}
                    ${isPast ? 'cursor-default' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Details panel ---- */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-200" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100" /> Unavailable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-ink-100" /> Past
            </span>
          </div>

          {weeklyInfo?.startTime && (
            <div className="flex items-center gap-2 text-sm text-ink-600 bg-ink-50 rounded-xl p-3">
              <FaClock className="text-primary-600 shrink-0" />
              <span>
                Usual hours <b>{weeklyInfo.startTime} – {weeklyInfo.endTime}</b>
                {openDaysLeft > 0 && (
                  <span className="text-ink-400"> • {openDaysLeft} open day{openDaysLeft !== 1 ? 's' : ''} left this month</span>
                )}
              </span>
            </div>
          )}

          {selectedKey && selected ? (
            <div className={`text-sm rounded-xl p-3 border ${
              selected.available
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <p className="font-semibold">
                {new Date(`${selectedKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {selected.available ? (
                <p className="text-xs mt-0.5">
                  Available {selected.startTime}–{selected.endTime}
                  {selected.slots?.length ? ` • ${selected.slots.length} time slots` : ''}
                  {selected.isSpecial ? ' • Special opening' : ''}
                </p>
              ) : (
                <p className="text-xs mt-0.5">{selected.reason || 'Not available on this date'}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-ink-400">Tap a date to see the doctor's hours for that day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailabilityCalendar;