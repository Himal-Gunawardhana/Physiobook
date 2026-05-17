import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileAvailability.css';

/**
 * TherapistProfileAvailability Component
 * Allows therapists to set and update their personal availability profile
 * Used in therapist dashboard to manage global availability schedule
 */
const TherapistProfileAvailability = ({ therapistId }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingDay, setEditingDay] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchAvailability();
  }, [therapistId]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/staff/me/profile-availability', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAvailability(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load availability');
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (dayName, dayIndex, field, value) => {
    const updatedAvail = { ...availability };
    updatedAvail[dayName] = {
      ...updatedAvail[dayName],
      [field]: value,
    };
    setAvailability(updatedAvail);
    setEditingDay(dayIndex);
  };

  const handleToggleDay = (dayName) => {
    const updatedAvail = { ...availability };
    updatedAvail[dayName].available = !updatedAvail[dayName].available;
    if (!updatedAvail[dayName].available) {
      updatedAvail[dayName].start_time = null;
      updatedAvail[dayName].end_time = null;
    } else {
      updatedAvail[dayName].start_time = '09:00:00';
      updatedAvail[dayName].end_time = '17:00:00';
    }
    setAvailability(updatedAvail);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Transform availability format for API
      const availabilityArray = days.map((day, index) => ({
        dayOfWeek: index,
        startTime: availability[day].available ? availability[day].start_time : null,
        endTime: availability[day].available ? availability[day].end_time : null,
        isActive: availability[day].available,
      }));

      const response = await axios.put(
        '/api/v1/staff/me/profile-availability',
        { availability: availabilityArray },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setAvailability(response.data.data || response.data);
      setSuccess('Availability updated successfully! 🎉');
      setEditingDay(null);

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
        {days.map((day, dayIndex) => (
          <div key={day} className={`availability-day ${!availability[day].available ? 'inactive' : ''}`}>
            <div className="day-header">
              <label className="day-toggle">
                <input
                  type="checkbox"
                  checked={availability[day].available}
                  onChange={() => handleToggleDay(day)}
                  className="toggle-checkbox"
                />
                <span className="day-name">{day}</span>
              </label>
            </div>

            {availability[day].available && (
              <div className="time-inputs">
                <div className="time-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={availability[day].start_time || '09:00'}
                    onChange={(e) =>
                      handleDayChange(day, dayIndex, 'start_time', e.target.value + ':00')
                    }
                    className="time-input"
                  />
                </div>

                <div className="time-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={availability[day].end_time || '17:00'}
                    onChange={(e) =>
                      handleDayChange(day, dayIndex, 'end_time', e.target.value + ':00')
                    }
                    className="time-input"
                  />
                </div>
              </div>
            )}

            {!availability[day].available && (
              <div className="day-off">Not available</div>
            )}
          </div>
        ))}
      </div>

      <div className="availability-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || editingDay === null}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
        <button
          className="btn btn-secondary"
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
