import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaBell, FaHourglassHalf, FaCalendarPlus, FaCheckCircle, FaTimesCircle, FaBan, FaClipboardCheck,
} from 'react-icons/fa';
import { timeAgo } from '../owner/reviewUtils';

// How often the bell checks for new notifications
const POLL_MS = 30000;

// Icon + colour per notification type
const typeStyle = {
  APPOINTMENT_REQUESTED: { icon: <FaCalendarPlus />, cls: 'bg-blue-100 text-blue-600' },
  APPOINTMENT_APPROVED: { icon: <FaCheckCircle />, cls: 'bg-green-100 text-green-600' },
  APPOINTMENT_REJECTED: { icon: <FaTimesCircle />, cls: 'bg-red-100 text-red-500' },
  APPOINTMENT_CANCELLED: { icon: <FaBan />, cls: 'bg-ink-100 text-ink-500' },
  APPOINTMENT_COMPLETED: { icon: <FaClipboardCheck />, cls: 'bg-primary-100 text-primary-700' },
  REMINDER: { icon: <FaHourglassHalf />, cls: 'bg-amber-100 text-amber-600' },
};
const fallbackStyle = { icon: <FaBell />, cls: 'bg-ink-100 text-ink-500' };

const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef(null);
  // Highest notification id already seen; null until the first load, so old
  // notifications don't pop up as toasts when the page opens.
  const lastIdRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/notifications');
      const list = res.data?.notifications || [];
      setItems(list);
      setUnread(res.data?.unreadCount || 0);

      const maxId = list.reduce((m, n) => Math.max(m, n.id), 0);
      if (lastIdRef.current === null) {
        lastIdRef.current = maxId;
      } else {
        const fresh = list.filter((n) => n.id > lastIdRef.current && !n.isRead);
        if (fresh.length === 1) {
          toast(`🔔 ${fresh[0].title}\n${fresh[0].message || ''}`, { duration: 6000 });
        } else if (fresh.length > 1) {
          toast(`🔔 You have ${fresh.length} new notifications`, { duration: 6000 });
        }
        lastIdRef.current = Math.max(lastIdRef.current, maxId);
      }
    } catch (error) {
      // Silent — the bell simply keeps its last state
    }
  }, []);

  // Automatic updates: load now, then every 30s while the tab is visible,
  // and again whenever the user comes back to the tab.
  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  // Close the dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = () => {
    if (!open) load();
    setOpen((o) => !o);
  };

  const handleItemClick = (n) => {
    setOpen(false);
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      api.put(`/api/v1/notifications/${n.id}/read`).catch(() => {});
    }
    if (n.link) {
      // Reminder notifications for a pet should open that pet's Reminders tab
      // (also fixes older notifications saved without the tab in their link).
      const isPetLink = /^\/owner\/pets\/\d+$/.test(n.link);
      navigate(n.type === 'REMINDER' && isPetLink ? `${n.link}?tab=reminders` : n.link);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch (error) {
      toast.error('Could not update notifications');
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 transition-all duration-200 ${
          open ? 'text-white' : ''
        }`}
      >
        <FaBell className="text-lg" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-primary-600">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 top-[4.5rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-elevated border border-ink-100 overflow-hidden animate-slideDown z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <h3 className="text-sm font-semibold text-ink-800">
              Notifications
              {unread > 0 && (
                <span className="ml-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2 py-0.5">
                  {unread} new
                </span>
              )}
            </h3>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-10 text-center">
                <FaBell className="text-2xl text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-500 font-medium">You're all caught up</p>
                <p className="text-xs text-ink-400 mt-0.5">New notifications will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100">
                {items.map((n) => {
                  const style = typeStyle[n.type] || fallbackStyle;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`w-full text-left flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50 ${
                        n.isRead ? '' : 'bg-primary-50'
                      }`}
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${style.cls}`}>
                        {style.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink-800">{n.title}</span>
                        <span className="block text-xs text-ink-500 mt-0.5 line-clamp-3">{n.message}</span>
                        <span className="block text-[11px] text-ink-400 mt-1">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

