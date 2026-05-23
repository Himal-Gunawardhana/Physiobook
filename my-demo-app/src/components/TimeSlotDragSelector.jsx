import React, { useState, useRef, useEffect, useMemo } from 'react';

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

  // Create a set of available minutes for fast lookup
  const availableMinutesSet = useMemo(() => {
    const set = new Set();
    slots.forEach((slot) => {
      const mins = timeToMinutes(slot);
      if (mins !== null) {
        set.add(mins);
      }
    });
    return set;
  }, [slots]);

  // Check if a specific time slot is available
  const isTimeAvailable = (mins) => {
    return availableMinutesSet.has(mins);
  };

  // Check if entire duration range can be booked starting from mins
  const canBookRange = (startMins) => {
    if (!isTimeAvailable(startMins)) return false;
    // Check if this exact slot exists in the slots array
    const timeStr = minutesToTime(startMins);
    return slots.includes(timeStr);
  };

  // Get mouse position on timeline and snap to nearest available slot
  const getTimeFromMouse = (e) => {
    if (!timelineRef.current || slots.length === 0) return null;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;

    const totalMinutes = (endHour - startHour) * 60;
    const clickedMinutes = percentage * totalMinutes;
    const baseMins = startHour * 60 + clickedMinutes;

    // Find the closest available slot
    let closestSlot = null;
    let closestDistance = Infinity;

    slots.forEach((slot) => {
      const slotMins = timeToMinutes(slot);
      const distance = Math.abs(slotMins - baseMins);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSlot = slotMins;
      }
    });

    if (closestSlot !== null && closestDistance <= 30) {
      // Only snap if within 30 min of clicked position
      return closestSlot;
    }

    return null;
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
    if (!isDragging || dragStart === null) {
      setIsDragging(false);
      setDragStart(null);
      setHoverTime(null);
      return;
    }

    // Use the first selected position
    const bookedSlotTime = minutesToTime(dragStart);

    if (canBookRange(dragStart)) {
      setSelectedSlot(bookedSlotTime);
      onSelectSlot(bookedSlotTime);
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
  }, [isDragging, dragStart]);

  // Generate timeline cells based on actual available slots
  const timelineBlocks = useMemo(() => {
    if (slots.length === 0) return [];

    // Sort slots by time
    const sortedSlots = [...slots]
      .map((slot) => ({ slot, mins: timeToMinutes(slot) }))
      .filter((s) => s.mins !== null)
      .sort((a, b) => a.mins - b.mins);

    if (sortedSlots.length === 0) return [];

    const blocks = [];
    const dayStart = startHour * 60;
    const dayEnd = endHour * 60;

    // Add initial gap if first slot is not at start
    if (sortedSlots[0].mins > dayStart) {
      blocks.push({
        type: 'gap',
        startMins: dayStart,
        endMins: sortedSlots[0].mins,
        startTime: minutesToTime(dayStart),
        endTime: minutesToTime(sortedSlots[0].mins),
      });
    }

    // Add slots and gaps between them
    for (let i = 0; i < sortedSlots.length; i++) {
      const current = sortedSlots[i];
      blocks.push({
        type: 'slot',
        startMins: current.mins,
        endMins: current.mins + 1, // Minimal width, just for visualization
        slot: current.slot,
        startTime: current.slot,
      });

      // Add gap to next slot if exists
      if (i < sortedSlots.length - 1) {
        const next = sortedSlots[i + 1];
        if (next.mins > current.mins + 1) {
          blocks.push({
            type: 'gap',
            startMins: current.mins + 1,
            endMins: next.mins,
            startTime: minutesToTime(current.mins + 1),
            endTime: minutesToTime(next.mins),
          });
        }
      } else {
        // Add gap at end if last slot is not at end
        if (current.mins + 1 < dayEnd) {
          blocks.push({
            type: 'gap',
            startMins: current.mins + 1,
            endMins: dayEnd,
            startTime: minutesToTime(current.mins + 1),
            endTime: minutesToTime(dayEnd),
          });
        }
      }
    }

    return blocks;
  }, [slots, startHour, endHour]);

  // Calculate selection preview
  const selectionInfo = useMemo(() => {
    if (dragStart === null) return null;
    const startTime = minutesToTime(dragStart);
    const endTime = minutesToTime(dragStart + duration);
    return { startTime, endTime, startMins: dragStart };
  }, [dragStart, duration]);

  const totalMinutes = (endHour - startHour) * 60;

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
        {/* Timeline blocks for each available slot and gaps */}
        {timelineBlocks.map((block, idx) => {
          const blockWidth = ((block.endMins - block.startMins) / totalMinutes) * 100;
          const isSelected = dragStart === block.startMins && block.type === 'slot';

          return (
            <div
              key={`${block.type}-${idx}`}
              onClick={() => {
                if (block.type === 'slot') {
                  setSelectedSlot(block.slot);
                  onSelectSlot(block.slot);
                }
              }}
              style={{
                flex: `0 0 ${blockWidth}%`,
                background:
                  block.type === 'slot'
                    ? isSelected
                      ? primaryColor
                      : '#f0fdf4'
                    : '#fef2f2',
                border:
                  block.type === 'slot'
                    ? isSelected
                      ? `2px solid ${primaryColor}`
                      : '1px solid #86efac'
                    : '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                fontSize: block.type === 'slot' ? '0.7rem' : '0.6rem',
                fontWeight: block.type === 'slot' ? 700 : 500,
                color:
                  block.type === 'slot'
                    ? isSelected
                      ? '#fff'
                      : '#047857'
                    : '#991b1b',
                textAlign: 'center',
                cursor: block.type === 'slot' ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
                userSelect: 'none',
                minWidth: '40px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={
                block.type === 'slot'
                  ? `Available at ${formatTime(block.slot)}`
                  : `Booked: ${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
              }
            >
              {block.type === 'slot' ? formatTime(block.slot) : '✕'}
            </div>
          );
        })}
      </div>

      {/* Selection display */}
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Click to select a {duration}-minute slot
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
          <span style={{ color: '#047857', fontWeight: 600 }}>Available Slots</span>
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
