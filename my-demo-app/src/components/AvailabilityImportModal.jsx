import React, { useState } from 'react';
import axios from 'axios';
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
  profileAvailability,
}) => {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleImport = async () => {
    setImporting(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/v1/clinic/${clinicId}/staff/${staffId}/import-profile-availability`,
        { therapistUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Success!
      if (onSuccess) {
        onSuccess(response.data.data || response.data);
      }

      // Close modal after 1 second
      setTimeout(() => {
        setConfirmStep(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import availability');
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
            {profileAvailability ? (
              <div className="modal-body">
                <p className="preview-intro">
                  <strong>{therapistName}</strong> has set the following personal availability:
                </p>

                <div className="availability-preview">
                  {days.map((day, index) => {
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
                    <strong>📝 Note:</strong> Changes to their personal availability later will NOT
                    affect your clinic's copy.
                  </p>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="loading-message">
                  <p>Loading {therapistName}'s availability...</p>
                  <div className="spinner"></div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={importing}
              >
                Skip
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setConfirmStep(true)}
                disabled={importing || !profileAvailability}
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
