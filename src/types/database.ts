// ============================================
// Shared Database Types for MOVIX Logistics Pro
// ============================================

export type ShipmentStatus =
  | 'pending'
  | 'searching'
  | 'bidding'
  | 'carrier_selected'
  | 'accepted'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type JobRequestStatus =
  | 'pending'
  | 'bid_submitted'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type UserRole = 'carrier' | 'client' | 'admin';

// ---- Profiles ----
export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

// ---- Shipments ----
export interface Shipment {
  id: string;
  client_id: string;
  carrier_id: string | null;
  origin: string;
  destination: string;
  distance: number | null;
  weight: number;
  cargo_type: string;
  is_express: boolean;
  has_insurance: boolean;
  status: ShipmentStatus;
  price: number;
  eta: string | null;
  estimated_arrival_time: string | null;
  items: any[] | null;
  delivery_pin?: string | null;
  cargo_photo_url?: string | null;
  is_shared?: boolean;
  load_optimization_data?: any;
  created_at: string;
  updated_at: string;
}

// ---- Job Requests ----
export interface JobRequest {
  id: string;
  shipment_id: string;
  carrier_id: string | null;
  status: JobRequestStatus;
  expires_at: string;
  responded_at: string | null;
  bid_amount: number | null;
  bid_message: string | null;
  created_at: string;
  // Joined data (optional)
  shipment?: Shipment;
}

// ---- Realtime Payload ----
export interface RealtimePayload<T> {
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
  schema: string;
  table: string;
}
