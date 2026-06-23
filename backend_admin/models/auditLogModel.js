import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  adminId:     { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  adminName:   { type: String, required: true },
  adminEmail:  { type: String, default: null },
  action:      { type: String, required: true },
  entityType:  { type: String, required: true },
  entityId:    { type: String, default: null },
  entityLabel: { type: String, default: null },
  before:      { type: mongoose.Schema.Types.Mixed, default: null },
  after:       { type: mongoose.Schema.Types.Mixed, default: null },
  reason:      { type: String, trim: true, default: null },
  success:     { type: Boolean, default: true },
  failReason:  { type: String, default: null },
  ipAddress:   { type: String, default: null },
  userAgent:   { type: String, default: null },
}, { timestamps: true, versionKey: false });

auditLogSchema.index({ adminId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
