
export type ViewState = 'landing' | 'request' | 'driver' | 'profile';

export enum VehicleType {
  SEDAN = 'Sedan (Small Items)',
  SUV = 'SUV (Medium Items)',
  PICKUP = 'Pickup Truck (Large Items)',
  BOX_TRUCK = 'Box Truck (Whole Room)',
  VAN = 'Cargo Van (Weather Sensitive)'
}

export interface Job {
  id: string;
  title: string;
  description: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'accepted' | 'completed';
  price: number; // Driver payout
  platformFee: number; // App fee
  vehicleType: VehicleType;
  imageUrl?: string;
  createdAt: number;
  distanceMiles: number;
  aiAnalysis?: string;
  driverConfirmed?: boolean;
  requesterConfirmed?: boolean;
  handlingInstructions?: string;
  fragility?: string;
  ratingForDriver?: number;
  ratingForRequester?: number;
}

export interface AIAnalysisResult {
  vehicleType: VehicleType;
  estimatedWeightLb: number;
  difficultyScore: number; // 1-10
  reasoning: string;
  suggestedPrice: number;
}
