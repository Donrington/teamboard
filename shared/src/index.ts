/**
 * @teamboard/shared
 * -----------------
 * The single source of truth for the data contracts that cross the wire between
 * the NestJS backend and the React frontend. Backend DTOs implement these shapes;
 * the frontend API layer consumes them. A change here is a compile error on both
 * sides — which is exactly the safety net we want. (See docs/00 · ADR-007.)
 *
 * Convention: these describe the JSON *over the wire*, so ids are `string`
 * (not Mongo `ObjectId`) and timestamps are ISO date `string`s.
 */

/* ------------------------------------------------------------------ *
 * Task status — a first-class enum shared by DB, API validation, and UI.
 * ------------------------------------------------------------------ */
export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Done = 'done',
}

/** Iteration order for boards, selects, and validation. */
export const TASK_STATUSES: readonly TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
] as const;

/** Human-readable labels — one place, reused by API responses and UI chips. */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
};

/* ------------------------------------------------------------------ *
 * Entities (as serialised to the client).
 * ------------------------------------------------------------------ */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  /** Profile photo URL (Cloudinary), if the user has uploaded one. */
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  /** Owner user id. */
  owner: string;
  /** Optional aggregate the API may attach for list views. */
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  /** Parent project id. */
  project: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ *
 * Auth contracts.
 * ------------------------------------------------------------------ */
export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPublic;
}

/** Decoded JWT body. `sub` is the user id (RFC 7519 "subject"). */
export interface JwtClaims {
  sub: string;
  email: string;
}

/* ------------------------------------------------------------------ *
 * Write payloads (mirror the backend DTOs).
 * ------------------------------------------------------------------ */
export interface CreateProjectPayload {
  title: string;
  description?: string;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

/* ------------------------------------------------------------------ *
 * Profile management. Email is intentionally not editable here.
 * ------------------------------------------------------------------ */
export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string;
}

/** Deleting an account requires re-entering the password (destructive-action guard). */
export interface DeleteAccountPayload {
  password: string;
}

/** Shape of the API's structured error responses (from the global filter). */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
}
