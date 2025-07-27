// models/habitat.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IHabitat extends Document {
  name: string;
  description?: string;
  // ...autres champs
}

const habitatSchema = new Schema<IHabitat>({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

export default model<IHabitat>('Habitat', habitatSchema);
