import React, { useState, useRef, useMemo } from 'react';

/**
 * TimeSlotDragSelector Component
 * Interactive time slot selector for selecting appointment slots
 * Shows all available slots from database as clickable buttons
 * User clicks to select a time slot based on service duration
 */
export default function TimeSlotDragSelector({
  slots = [],
  duration = 30,
  selectedDate = '',
  onSelectSlot = () => {},
  primaryColor = '#2563eb',
  startHour = 6,
  endHour = 22,
}) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const timelineRef = useRef(null);

  // Convert time string "HH:MM" to minutes since start of day
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Convert minutes since start of day to time string "HH:MM"
  const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Format time for display
  const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour % 12) || 12).toString().padStart(2, '0');
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Generate timeline cells based on actual available slots
  const timelineBlocks = useMemo(() => {
    if (slots.length === 0) return [];

    // Sort slots by time and return only actual available slots
    const sortedSlots = [...slots]
      .map((slot) => ({ slot, mins: timeToMinutes(slot) }))
      .filter((s) => s.mins !== null)
      .sort((a, b) => a.mins - b.mins);

    if (sortedSlots.length === 0) return [];

    // Return only the available slots - no dummy gaps or booked blocks
    return sortedSlots.map((s) => ({
      type: 'slot',
      startMins: s.mins,
      slot: s.slot,
      startTime: s.slot,
    }));
  }, [slots]);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Scrollable container for slots */}
      <div
        ref={timelineRef}
        style={{
          position: 'relative',
          display: 'flex',
          height: '80px',
          borderRadius: '12px',
          border: `2px solid ${primaryColor}40`,
          background: '#fff',
          overflowX: 'auto',
          overflowY: 'hidden',
          cursor: 'default',
          userSelect: 'none',
          gap: '0.5rem',
          padding: '0.5rem',
          scrollBehavior: 'smooth',
          alignItems: 'center',
          '::-webkit-scrollbar': {
            height: '6px',
          },
          '::-webkit-scrollbar-track': {
            background: '#f1f5f9',
            borderRadius: '10px',
          },
          '::-webkit-scrollbar-thumb': {
            background: primaryColor,
            borderRadius: '10px',
          },
        }}
      >
        {/* Available time slot buttons - only real slots from database */}
        {timelineBlocks.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            No available slots
          </div>
        ) : (
          timelineBlocks.map((block) => {
            const isSelected = selectedSlot === block.slot;

            return (
              <button
                key={`slot-${block.slot}`}
                onClick={() => {
                  setSelectedSlot(block.slot);
                  onSelectSlot(block.slot);
                }}
                style={{
                  flex: '0 0 auto',
                  minWidth: '80px',
                  padding: '0.75rem 1rem',
                  background: isSelected ? primaryColor : '#f0fdf4',
                  border: isSelected ? `2px solid ${primaryColor}` : '2px solid #86efac',
                  borderRadius: '8px',
                  color: isSelected ? '#fff' : '#047857',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  boxShadow: isSelected ? `0 4px 12px ${primaryColor}40` : 'none',
                  ':hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                title={`Book at ${formatTime(block.slot)}`}
              >
                {formatTime(block.slot)}
              </button>
            );
          })
        )}
      </div>

      {/* Selection display */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          {timelineBlocks.length === 0
            ? 'No available slots for this date'
            : `${timelineBlocks.length} available slot${timelineBlocks.length === 1 ? '' : 's'}`}
        </div>

        {selectedSlot && (
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: primaryColor,
              background: `${primaryColor}15`,
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: `1px solid ${primaryColor}30`,
            }}
          >
            Selected: {formatTime(selectedSlot)} - {formatTime(minutesToTime(timeToMinutes(selectedSlot) + duration))}
          </div>
        )}
      </div>

      {/* Info text */}
      <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#94a3b8' }}>
        💡 {timelineBlocks.length > 0 ? 'Click any time slot to book' : 'Try a different date or therapist'}
      </div>
    </div>
  );
}
