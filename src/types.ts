export interface Program {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  ageRange: string;
  ageGroups: string[];
  features: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  coords: { lat: number; lng: number };
  schedule?: string;
  description: string;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface Camp {
  id: string;
  name: string;
  locationId: string;
  dates: string;
  price: number;
  description: string;
}

export interface Lead {
  id: string;
  fullName: string;
  age: number;
  parentName?: string;
  phone: string;
  email: string;
  programId: string;
  batch: string;
  source?: string;
  status: 'inquiry' | 'confirmed';
  createdAt: number;
}

export interface Registration {
  id: string;
  leadId: string;
  orderId: string;
  paymentId?: string;
  amount: number;
  status: 'pending' | 'paid';
  paidAt?: number;
  signedWaiverAt?: number;
  ipAddress?: string;
}

export interface ProgramCapacity {
  programId: string;
  capacity: number;
  filled: number;
  fee: number;
}
