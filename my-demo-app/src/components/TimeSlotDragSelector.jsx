import React, { useState, useRef, useEffect } from 'react';

/**
 * TimeSlotDragSelector Component
 * Interactive draggable timeline for selecting appointment slots
 * Shows available slots in green, booked slots in red
 * User drags to select a time slot based on service duration
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
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

  // Check if a slot is booked
  const isSlotBooked = (timeSlot) => !slots.includes(timeSlot);

  // Check if time range conflicts with booked slots
  const hasConflict = (startMin, endMin) => {
    const startTime = minutesToTime(startMin);
    const endTime = minutesToTime(endMin);

    for (let m = startMin; m < endMin; m += 5) {
      const checkTime = minutesToTime(m);
      if (isSlotBooked(checkTime)) {
        return true;
      }
    }
    return false;
  };

  // Get mouse position on timeline and calculate slot time
  const getTimeFromMouse = (e) => {
    if (!timelineRef.current) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;

    const totalMinutes = (endHour - startHour) * 60;
    const clickedMinutes = Math.round(percentage * totalMinutes / 5) * 5; // Round to 5-min increments
    const minutes = startHour * 60 + clickedMinutes;

    if (minutes < startHour * 60 || minutes >= endHour * 60) return null;
    return minutes;
  };

  const handleMouseDown = (e) => {
    const timeMin = getTimeFromMouse(e);
    if (timeMin === null) return;
    setIsDragging(true);
    setDragStart(timeMin);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const timeMin = getTimeFromMouse(e);
    if (timeMin !== null) {
      setHoverTime(timeMin);
    }
  };

  const handleMouseUp = (e) => {
    if (!isDragging || dragStart === null || hoverTime === null) {
      setIsDragging(false);
      setDragStart(null);
      setHoverTime(null);
      return;
    }

    const startMin = Math.min(dragStart, hoverTime);
    const endMin = startMin + duration;

    // Check if selected range is valid
    if (endMin > endHour * 60) {
      setIsDragging(false);
      setDragStart(null);
      setHoverTime(null);
      return;
    }

    const selectedSlot = minutesToTime(startMin);

    // Check if slot is available
    if (slots.includes(selectedSlot)) {
      onSelectSlot(selectedSlot);
    }

    setIsDragging(false);
    setDragStart(null);
    setHoverTime(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, hoverTime]);

  // Generate timeline cells (5-minute increments)
  const totalMinutes = (endHour - startHour) * 60;
  const cellCount = totalMinutes / 5;
  const cells = [];

  for (let i = 0; i < cellCount; i++) {
    const cellMinutes = i * 5;
    const timeMin = startHour * 60 + cellMinutes;
    const timeStr = minutesToTime(timeMin);

    // Check if this 5-min cell is part of any available slot
    let isAvailable = false;
    for (let slotTime of slots) {
      const slotMin = timeToMinutes(slotTime);
      if (slotMin === timeMin) {
        isAvailable = true;
        break;
      }
    }

    // Determine cell color
    let bgColor = '#f0fdf4'; // Light green for available
    let borderColor = '#86efac'; // Green border

    if (!isAvailable) {
      bgColor = '#fef2f2'; // Light red for booked
      borderColor = '#fca5a5'; // Red border
    }

    // Highlight selection range
    let isInSelection = false;
    if (dragStart !== null && hoverTime !== null) {
      const selStart = Math.min(dragStart, hoverTime);
      const selEnd = selStart + duration;
      if (timeMin >= selStart && timeMin < selEnd) {
        isInSelection = true;
        bgColor = primaryColor;
        borderColor = primaryColor;
      }
    }

    cells.push({
      id: timeStr,
      timeStr,
      timeMin,
      isAvailable,
      bgColor,
      borderColor,
      isInSelection,
    });
  }

  // Calculate selection preview dimensions
  let selectionStyle = null;
  if (dragStart !== null && hoverTime !== null) {
    const selStart = Math.min(dragStart, hoverTime);
    const selEnd = Math.min(Math.max(dragStart, hoverTime), selStart + duration);
    const startPercent = ((selStart - startHour * 60) / totalMinutes) * 100;
    const widthPercent = ((selEnd - selStart) / totalMinutes) * 100;

    selectionStyle = {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
    };
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          display: 'flex',
          height: '80px',
          borderRadius: '12px',
          border: `2px solid ${primaryColor}40`,
          background: '#fff',
          overflow: 'hidden',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {/* Timeline cells */}
        {cells.map((cell) => (
          <div
            key={cell.timeStr}
            style={{
              flex: 1,
              background: cell.bgColor,
              borderRight: `1px solid ${cell.borderColor}`,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '0.3rem',
              fontSize: '0.65rem',
              color: cell.isAvailable ? '#047857' : '#991b1b',
              fontWeight: 600,
              transition: 'all 0.1s',
              opacity: cell.isInSelection ? 1 : 0.8,
            }}
            title={`${cell.timeStr} - ${cell.isAvailable ? 'Available' : 'Booked'}`}
          >
            {/* Show hour labels every hour */}
            {cell.timeMin % 60 === 0 && (
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {formatTime(cell.timeStr).split(' ')[0]}
              </div>
            )}
          </div>
        ))}

        {/* Selection overlay */}
        {selectionStyle && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: selectionStyle.left,
              width: selectionStyle.width,
              height: '100%',
              background: `${primaryColor}30`,
              borderLeft: `3px solid ${primaryColor}`,
              borderRight: `3px solid ${primaryColor}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Drag instruction and time display */}
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Drag to select a {duration}-minute slot
        </div>

        {dragStart !== null && hoverTime !== null && (
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
            {formatTime(minutesToTime(Math.min(dragStart, hoverTime)))} -{' '}
            {formatTime(minutesToTime(Math.min(dragStart, hoverTime) + duration))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '4px',
            }}
          />
          <span style={{ color: '#047857', fontWeight: 600 }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              background: '#fef2f2',
              border: '2px solid #fca5a5',
              borderRadius: '4px',
            }}
          />
          <span style={{ color: '#991b1b', fontWeight: 600 }}>Booked</span>
        </div>
      </div>
    </div>
  );
}
