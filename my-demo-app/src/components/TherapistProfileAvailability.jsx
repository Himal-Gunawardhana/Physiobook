import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import './ProfileAvailability.css';

/**
 * TherapistProfileAvailability Component
 * Allows therapists to set and update their personal availability profile
 * Used in therapist dashboard to manage global availability schedule
 */
const TherapistProfileAvailability = ({ therapistId }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const createDefaultAvailability = () =>
    days.map((_, index) => ({
      dayOfWeek: index,
      startTime: index === 6 ? null : '09:00:00',
      endTime: index === 6 ? null : '17:00:00',
      isActive: index !== 6,
    }));

  const normalizeAvailability = (payload) => {
    const source = payload?.availability ?? payload?.data?.availability ?? payload?.data ?? payload;

    if (Array.isArray(source)) {
      return days.map((_, index) => {
        const match = source.find((item) => Number(item?.dayOfWeek) === index);
        return match || {
          dayOfWeek: index,
          startTime: index === 6 ? null : '09:00:00',
          endTime: index === 6 ? null : '17:00:00',
          isActive: index !== 6,
        };
      });
    }

    if (source && typeof source === 'object') {
      return days.map((day, index) => {
        const key = day.toLowerCase();
        const legacy = source[key] || source[day] || {};

        return {
          dayOfWeek: index,
          startTime: legacy.startTime || legacy.start_time || (index === 6 ? null : '09:00:00'),
          endTime: legacy.endTime || legacy.end_time || (index === 6 ? null : '17:00:00'),
          isActive: legacy.isActive ?? legacy.available ?? legacy.enabled ?? (index !== 6),
        };
      });
    }

    return createDefaultAvailability();
  };

  const ensureAvailabilityShape = (items) =>
    days.map((_, index) => {
      const existing = items.find((item) => Number(item.dayOfWeek) === index) || {};

      return {
        dayOfWeek: index,
        startTime: existing.isActive === false ? null : (existing.startTime || '09:00:00'),
        endTime: existing.isActive === false ? null : (existing.endTime || '17:00:00'),
        isActive: Boolean(existing.isActive),
      };
    });

  useEffect(() => {
    fetchAvailability();
  }, [therapistId]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/staff/me/profile-availability');
      setAvailability(normalizeAvailability(response));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load availability');
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (dayIndex, field, value) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayIndex
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const handleToggleDay = (dayIndex, checked) => {
    setAvailability((prev) =>
      prev.map((item) => {
        if (item.dayOfWeek !== dayIndex) {
          return item;
        }

        return {
          ...item,
          isActive: checked,
          startTime: checked ? (item.startTime || '09:00:00') : null,
          endTime: checked ? (item.endTime || '17:00:00') : null,
        };
      })
    );
  };

  const handleSetTypicalHours = () => {
    setAvailability((prev) =>
      prev.map((item) => {
        // Skip Sunday (index 6)
        if (item.dayOfWeek === 6) {
          return item;
        }
        return {
          ...item,
          isActive: true,
          startTime: '09:00:00',
          endTime: '17:00:00',
        };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const availabilityArray = ensureAvailabilityShape(availability);
      await api.put('/staff/me/profile-availability', {
        availability: availabilityArray,
      });

      setSuccess('Availability updated successfully! 🎉');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update availability');
      console.error('Error saving availability:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="availability-container loading">Loading your availability...</div>;
  }

  if (!availability) {
    return <div className="availability-container error">Unable to load availability</div>;
  }

  return (
    <div className="availability-container">
      <div className="availability-header">
        <h2>📅 Your Availability Schedule</h2>
        <p>Set your personal availability for patient bookings across all clinics</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="availability-grid">
        {days.map((day, dayIndex) => {
          const dayAvailability = availability[dayIndex] || {
            dayOfWeek: dayIndex,
            startTime: dayIndex === 6 ? null : '09:00:00',
            endTime: dayIndex === 6 ? null : '17:00:00',
            isActive: dayIndex !== 6,
          };

          return (
          <div key={day} className={`availability-day ${!dayAvailability.isActive ? 'inactive' : ''}`}>
            <div className="day-header">
              <label className="day-toggle">
                <input
                  type="checkbox"
                  checked={dayAvailability.isActive}
                  onChange={(e) => handleToggleDay(dayIndex, e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="day-name">{day}</span>
              </label>
            </div>

            {dayAvailability.isActive && (
              <div className="time-inputs">
                <div className="time-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={(dayAvailability.startTime || '09:00:00').slice(0, 5)}
                    onChange={(e) => handleDayChange(dayIndex, 'startTime', `${e.target.value}:00`)}
                    className="time-input"
                  />
                </div>

                <div className="time-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={(dayAvailability.endTime || '17:00:00').slice(0, 5)}
                    onChange={(e) => handleDayChange(dayIndex, 'endTime', `${e.target.value}:00`)}
                    className="time-input"
                  />
                </div>
              </div>
            )}

            {!dayAvailability.isActive && (
              <div className="day-off">Not available</div>
            )}
          </div>
          );
        })}
      </div>

      <div className="availability-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleSetTypicalHours}
          disabled={saving}
        >
          Set Typical Hours (9AM-5PM)
        </button>
        <button
          className="btn btn-tertiary"
          onClick={fetchAvailability}
          disabled={saving}
        >
          Reset
        </button>
      </div>

      <div className="availability-info">
        <p>
          <strong>💡 Tip:</strong> Your availability is your personal schedule. When clinics add you to
          their team, they can import this schedule. You can always update it, and clinics using your
          availability will see the changes.
        </p>
      </div>
    </div>
  );
};

export default TherapistProfileAvailability;
