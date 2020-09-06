import mongoose, { Schema } from 'mongoose';
import validators from 'mongoose-validators';

const categorySchema = new Schema({
  name: {
    type: String,
  },
  slug: {
    type: String,
  },
  media: {
    icon: {
      type: String,
    },
    thumbnail: {
      type: String,
      validate: validators.isURL({
        message: 'Must be a Valid URL',
        protocols: ['http', 'https'],
        require_tld: true,
        require_protocol: true,
      }),
    },
    hero: {
      type: String,
      validate: validators.isURL({
        message: 'Must be a Valid URL',
        protocols: ['http', 'https'],
        require_tld: true,
        require_protocol: true,
      }),
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  showInFilters: {
    type: Boolean,
    default: true,
  },
  isCustomCategory: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
  },
  opentriviadb_categories: [{
    type: Number,
  }],
}, {
  timestamps: true,
});

categorySchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      media: {
        thumbnail: this.media.thumbnail,
      },
      slug: this.slug,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    return full ? {
      ...view,
      isCustomCategory: this.isCustomCategory,
      showInFilters: this.showInFilters,
      opentriviadb_categories: this.opentriviadb_categories,
      // add properties for a full view
    } : view;
  },
};

categorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name.replace(' ').toLowerCase();
  return next();
});

const model = mongoose.model('Category', categorySchema);

export const { schema } = model;
export default model;
