import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import './AvailabilityImportModal.css';

/**
 * AvailabilityImportModal Component
 * Allows clinic admins to import therapist's personal availability to their clinic
 * Shown when adding staff or in staff management interface
 */
const AvailabilityImportModal = ({
  isOpen,
  onClose,
  onSuccess,
  staffId,
  clinicId,
  therapistUserId,
  therapistName,
  profileAvailability: initialAvailability,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);
  const [profileAvailability, setProfileAvailability] = useState(initialAvailability || null);
  const [loading, setLoading] = useState(!initialAvailability);

  // Fetch availability if not provided as prop
  useEffect(() => {
    if (!isOpen || initialAvailability) return;

    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/staff/${therapistUserId}/public-availability`);
        // Extract availability from response, handling different response structures
        const availData = response?.data?.availability || response?.availability || response;
        setProfileAvailability(availData);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Unable to load therapist availability. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [isOpen, therapistUserId, initialAvailability]);

  if (!isOpen) return null;

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    try {
      const response = await api.post(
        `/clinics/${clinicId}/staff/${staffId}/import-profile-availability`,
        { therapistUserId }
      );

      // Success!
      if (onSuccess) {
        onSuccess(response);
      }

      // Close modal after 1 second
      setTimeout(() => {
        setConfirmStep(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err?.message || 'Failed to import availability');
      console.error('Error importing availability:', err);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !importing && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 Import Availability</h2>
          <button
            className="modal-close"
            onClick={() => !importing && onClose()}
            disabled={importing}
          >
            ✕
          </button>
        </div>

        {error && <div className="modal-alert alert-error">{error}</div>}

        {!confirmStep ? (
          <>
            {loading ? (
              <div className="modal-body">
                <div className="loading-message">
                  <p>Loading {therapistName}'s availability...</p>
                  <div className="spinner"></div>
                </div>
              </div>
            ) : profileAvailability ? (
              <div className="modal-body">
                <p className="preview-intro">
                  <strong>{therapistName}</strong> has set the following personal availability:
                </p>

                <div className="availability-preview">
                  {Object.keys(profileAvailability).map((day) => {
                    const avail = profileAvailability[day];
                    return (
                      <div key={day} className="preview-day">
                        <div className="preview-day-name">{day}</div>
                        <div className="preview-day-time">
                          {avail?.available ? (
                            <>
                              {avail.start_time} - {avail.end_time}
                            </>
                          ) : (
                            <span className="not-available">Not available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="import-info">
                  <p>
                    <strong>✨ What this does:</strong> This will import {therapistName}'s personal
                    availability to your clinic. You can edit it afterwards if needed.
                  </p>
                  <p>
                    <strong>� Auto-sync:</strong> Any changes {therapistName} makes to their personal
                    availability will automatically update your clinic's copy in real-time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="loading-message" style={{ color: '#ef4444' }}>
                  <p>⚠️ No availability data found</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Please ensure the therapist has set their personal availability first.
                  </p>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={importing || loading}
              >
                Skip
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setConfirmStep(true)}
                disabled={importing || loading || !profileAvailability}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body confirm-body">
              <div className="confirm-icon">✓</div>
              <p className="confirm-message">
                Ready to import availability for <strong>{therapistName}</strong>?
              </p>
              <p className="confirm-subtext">
                You can always edit or re-import later.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmStep(false)}
                disabled={importing}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Yes, Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AvailabilityImportModal;
