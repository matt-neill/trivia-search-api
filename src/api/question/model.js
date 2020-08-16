import mongoose, { Schema } from 'mongoose'
import keywords from 'mongoose-keywords';
import validators from 'mongoose-validators';

const questionSchema = new Schema({
  question: {
    type: String
  },
  answer: {
    type: String
  },
  category: {
    type: String
  },
  options: [
    {
      type: String
    }
  ],
  media: {
    type: String
  },
  notes: {
    type: String
  },
  tags: [
    {
      type: String
    }
  ],
  custom_category: {
    type: Boolean,
  },
  source: {
    type: String,
    validate: validators.isURL({
      message: 'Must be a Valid URL',
      protocols: ['http','https','ftp'],
      require_tld: true,
      require_protocol: true
    }),
  },
  createdBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

questionSchema.plugin(keywords, {paths: ['question', 'answer', 'options']});

questionSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      question: this.question,
      answer: this.answer,
      options: this.options,
      media: this.media,
      notes: this.notes,
      tags: this.tags,
      category: this.category,
      custom_category: this.custom_category,
      source: this.source,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Question', questionSchema)

export const schema = model.schema
export default model
