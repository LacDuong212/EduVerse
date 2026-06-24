import crypto from "crypto";

// Generate an unguessable, URL-safe certificate id (24 hex chars).
export const generateCertId = () => crypto.randomBytes(12).toString("hex");
