'use strict';

const START_HOUR = 9;
const END_HOUR = 18;
const SLOT_INTERVAL_MINUTES = 30;
const WEEKEND = [0];

function isWorkday(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  return !WEEKEND.includes(day);
}

function generateAllSlots() {
  const slots = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
      const h = String(hour).padStart(2, '0');
      const m = String(minute).padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

function getAvailableSlots(allSlots, bookedSlots = [], dateString) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  return allSlots.filter(slot => {
    if (bookedSlots.includes(slot)) return false;
    if (dateString === today) {
      const [h, m] = slot.split(':').map(Number);
      return h * 60 + m > now.getHours() * 60 + now.getMinutes();
    }
    return true;
  });
}

module.exports = { isWorkday, generateAllSlots, getAvailableSlots };