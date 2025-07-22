import { Schema, model, Types } from 'mongoose';

const auditSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: false }, // Parfois action anonyme
  action: { type: String, required: true }, // Ex : 'register', 'delete_account', 'update_profile'
  target: { type: String },                 // Ex : 'User', 'Plant', 'Comment'
  targetId: { type: Types.ObjectId },       // L’ID de la ressource cible
  details: { type: Object },                // Infos additionnelles utiles
  date: { type: Date, default: Date.now }
});

export default model('AuditLog', auditSchema);
