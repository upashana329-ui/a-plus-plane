export const HOSTEL_REQUEST_TYPES = [
  { value: 'ALLOCATION', label: 'Room Allocation / Bed Change' },
  { value: 'MAINTENANCE', label: 'Hostel Maintenance / Electrical / Plumbing' },
  { value: 'OTHER', label: 'General Hostel Request / Inquiry' },
];

export const HOSTEL_AMENITIES = [
  '24/7 High-speed Wi-Fi & Study Rooms',
  'Nutritious Mess & Dining Facility',
  'Automated Laundry Service',
  'Solar Water Heating & RO Water Purifier',
  'CCTV Security & Biometric Turnstiles',
  'Indoor Sports Recreation Area',
];

export const ROOM_TYPES = [
  { capacity: 2, label: 'Double Occupancy (2-Seater)' },
  { capacity: 3, label: 'Triple Occupancy (3-Seater)' },
  { capacity: 4, label: 'Four Occupancy (4-Seater)' },
];

export default {
  HOSTEL_REQUEST_TYPES,
  HOSTEL_AMENITIES,
  ROOM_TYPES,
};
