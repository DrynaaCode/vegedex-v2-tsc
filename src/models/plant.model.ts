import { Schema, model, Document, Types } from 'mongoose';

export interface IPlant extends Document {
  name: string;
  latinName: string;
  description?: string;
  images?: string[];
  family?: string;
  edibleParts?: string[];
  toxic?: boolean;
 habitats: Types.ObjectId[]; // Référence à Habitat
  seasons: Types.ObjectId[];  // Référence à Saison
}

const plantSchema = new Schema<IPlant>({
  name: { type: String, required: true },
  latinName: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  family: { type: String },
  edibleParts: [{ type: String }],
  toxic: { type: Boolean, default: false },
 habitats: [{ type: Schema.Types.ObjectId, ref: 'Habitat' }],
  seasons: [{ type: Schema.Types.ObjectId, ref: 'Season' }]
}, {
  timestamps: true,
  versionKey: false
});

export default model<IPlant>('Plant', plantSchema);
