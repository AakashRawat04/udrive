export const userTypes = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
} as const;

export const userStatus = {
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
} as const;

export const carRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  STARTED: "started",
  COMPLETED: "completed",
  TRANSFERRED: "transferred",
};
