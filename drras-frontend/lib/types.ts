// Mirrors the FastAPI backend's Pydantic schemas exactly (app/schemas/*.py).

export type UserRole = "admin" | "user";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export type DisasterType =
  | "flood"
  | "earthquake"
  | "fire"
  | "hurricane"
  | "tornado"
  | "tsunami"
  | "other";

export type DisasterStatus = "active" | "contained" | "resolved";

export interface Disaster {
  id: number;
  name: string;
  type: DisasterType;
  severity: number; // 1-10
  city: string;
  description: string | null;
  status: DisasterStatus;
  created_at: string;
  updated_at: string | null;
}

export interface DisasterCreateInput {
  name: string;
  type: DisasterType;
  severity: number;
  city: string;
  description?: string;
}

export type DisasterUpdateInput = Partial<DisasterCreateInput> & {
  status?: DisasterStatus;
};

export type RequestStatus = "pending" | "in_progress" | "resolved";

export interface EmergencyRequest {
  id: number;
  disaster_id: number;
  requester_name: string;
  phone: string;
  city: string;
  location: string;
  population_affected: number;
  food_needed: number;
  water_needed: number;
  medicine_needed: number;
  ambulances_needed: number;
  priority_score: number;
  status: RequestStatus;
  comments: string | null;
  created_at: string;
}

export interface EmergencyRequestCreateInput {
  disaster_id: number;
  requester_name: string;
  phone: string;
  city: string;
  location: string;
  population_affected: number;
  food_needed: number;
  water_needed: number;
  medicine_needed: number;
  ambulances_needed: number;
  comments?: string;
}

export type ResourceType = "food" | "water" | "medicine" | "ambulance";

export interface Resource {
  id: number;
  type: ResourceType;
  city: string;
  quantity_available: number;
  unit: string;
  updated_at: string;
}

export type SkillType = "doctor" | "driver" | "engineer" | "rescue_worker";

export interface Volunteer {
  id: number;
  name: string;
  phone: string;
  email: string;
  skill_type: SkillType;
  city: string;
  is_available: boolean;
  created_at: string;
}

export interface RoadBlock {
  id: number;
  city_from: string;
  city_to: string;
  distance_km: number;
  traffic_level: number;
  is_blocked: boolean;
  updated_at: string;
}

export interface RouteResponse {
  source: string;
  destination: string;
  path: string[];
  total_distance_km: number;
  algorithm: string;
  nodes_explored: number;
}

export interface AllocationItem {
  request_id: number;
  city: string;
  quantity_allocated: number;
  priority_score: number;
}

export interface AllocationResponse {
  resource_type: ResourceType;
  total_capacity: number;
  capacity_used: number;
  total_priority_value_served: number;
  allocations: AllocationItem[];
  unserved_request_ids: number[];
}

export interface MatchAssignment {
  request_id: number;
  volunteer_id: number;
  volunteer_name: string;
  skill_type: string;
  city: string;
}

export interface MatchResponse {
  total_assignments: number;
  assignments: MatchAssignment[];
  unmatched_request_ids: number[];
}

export interface AISummaryResponse {
  disaster_id: number;
  disaster_name: string;
  summary: string;
}

export interface AIAssistantResponse {
  question: string;
  answer: string;
}

export interface ApiError {
  detail: string;
}
