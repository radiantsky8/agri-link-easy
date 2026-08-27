/** Static / mock reference data for the farmer procurement portal. */

export type Centre = {
  id: string;
  name: string;
  district: string;
  address: string;
  distanceKm: number;
  queue: number;
  capacityPerSlot: number;
};

export const CENTRES: Centre[] = [
  {
    id: "c1",
    name: "Sri Sai Procurement Centre",
    district: "Nalgonda",
    address: "Canal Bund Road, Miryalaguda",
    distanceKm: 4.2,
    queue: 12,
    capacityPerSlot: 6,
  },
  {
    id: "c2",
    name: "Centre B — Market Yard",
    district: "Nalgonda",
    address: "Old Market Yard, Nalgonda",
    distanceKm: 9.6,
    queue: 5,
    capacityPerSlot: 8,
  },
  {
    id: "c3",
    name: "Green Fields Collection Point",
    district: "Suryapet",
    address: "NH-65 Bypass, Suryapet",
    distanceKm: 17.3,
    queue: 21,
    capacityPerSlot: 10,
  },
  {
    id: "c4",
    name: "Kisan Seva Kendra",
    district: "Khammam",
    address: "Wyra Road, Khammam",
    distanceKm: 26.8,
    queue: 3,
    capacityPerSlot: 6,
  },
];

export type Crop = {
  id: string;
  name: string;
  variety: string;
  ratePerQuintal: number;
};

export const CROPS: Crop[] = [
  { id: "rice", name: "Paddy / Rice", variety: "Grade A", ratePerQuintal: 2320 },
  { id: "wheat", name: "Wheat", variety: "Sharbati", ratePerQuintal: 2275 },
  { id: "maize", name: "Maize", variety: "Yellow", ratePerQuintal: 2090 },
  { id: "cotton", name: "Cotton", variety: "Medium staple", ratePerQuintal: 7121 },
  { id: "groundnut", name: "Groundnut", variety: "Bold", ratePerQuintal: 6377 },
];

export const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "10:45 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
];

export const FAQS = [
  {
    q: "What documents should I bring to the centre?",
    a: "Carry your Aadhaar card, the pattadar passbook / land record, and your booking token number. A printed or on-screen token both work.",
  },
  {
    q: "How is my token number decided?",
    a: "Tokens are issued in the order bookings are confirmed for a centre on a given date. Your position in the live queue updates as farmers ahead of you are served.",
  },
  {
    q: "Can I change my slot after booking?",
    a: "Yes. Open My Token and choose Reschedule, up to 2 hours before your slot. Rescheduling keeps your booking but issues a fresh token.",
  },
  {
    q: "When will I get paid?",
    a: "Payment is processed after weighing and quality checks are complete, usually within 2 working days, directly to the bank account in your profile.",
  },
  {
    q: "What if my payment fails?",
    a: "Check your bank details under More → Bank Details. If the account is correct, raise a complaint and the centre staff will re-initiate the transfer.",
  },
  {
    q: "Is there a limit on quantity per booking?",
    a: "You can book between 1 and 500 quintals per slot. For larger loads, create multiple bookings across slots or centres.",
  },
];

export const QUINTAL_TO_KG = 100;
