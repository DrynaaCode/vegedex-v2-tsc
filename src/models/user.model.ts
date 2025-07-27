import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserSettings {
  theme?: 'light' | 'dark' | 'auto';
  notifications?: boolean;
  language?: string; // 'fr', 'en', etc.
  newsletter?: boolean;
  timezone?: string;
}

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
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshToken?: string;
  settings?: IUserSettings;

  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true, trim: true, minlength: 3, maxlength: 32 },
  email:    { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  profilePicture: { type: String, default: '' },
  bio: { type: String, maxlength: 255, default: '' },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String, select: false },   // Hide from queries by default
  resetPasswordExpires: { type: Date, select: false },   // Hide from queries by default
  refreshToken: { type: String, select: false },         // Never expose this!
  settings: {
    theme:        { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    notifications:{ type: Boolean, default: true },
    language:     { type: String, default: 'fr' },
    newsletter:   { type: Boolean, default: false },
    timezone:     { type: String, default: 'Europe/Paris' }
  },
}, {
  timestamps: true,
  versionKey: false
});

// ----------- HOOK pre-save pour hasher auto le password -----------
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
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
