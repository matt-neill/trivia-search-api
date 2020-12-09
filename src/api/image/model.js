import mongoose, { Schema } from 'mongoose';

const imageSchema = new Schema({
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  public_id: {
    type: String,
  },
  version: {
    type: String,
  },
  signature: {
    type: String,
  },
  width: {
    type: String,
  },
  height: {
    type: String,
  },
  format: {
    type: String,
  },
  resource_type: {
    type: String,
  },
  url: {
    type: String,
  },
  secure_url: {
    type: String,
  },
  name: {
    type: String,
  },
}, {
  timestamps: true,
});

imageSchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      public_id: this.public_id,
      name: this.name,
      width: this.width,
      height: this.height,
      format: this.format,
      url: this.url,
      secure_url: this.secure_url,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    return full ? {
      ...view,
      version: this.version,
      signature: this.signature,
      resource_type: this.resource_type,
      createdBy: this.createdBy.view(true),
      // add properties for a full view
    } : view;
  },
};

const model = mongoose.model('Image', imageSchema);

export const { schema } = model;
export default model;
