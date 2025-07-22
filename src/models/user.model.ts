import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  profilePicture?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

// Définition du schéma
const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true, trim: true, minlength: 3, maxlength: 32 },
  email:    { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  profilePicture: { type: String, default: '' },
  bio: { type: String, maxlength: 255, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

// ----------- HOOK pre-save pour hasher auto le password -----------
userSchema.pre<IUser>('save', async function (next) {
  // Si password pas modifié, ne rehash pas
  if (!this.isModified('password')) return next();

  // Hash le mot de passe avec bcrypt
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// ----------- Méthode d’instance pour comparer un mot de passe -----------
userSchema.methods.comparePassword = function(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default model<IUser>('User', userSchema);
