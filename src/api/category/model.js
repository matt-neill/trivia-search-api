import mongoose, { Schema } from 'mongoose';
import validators from 'mongoose-validators';

const categorySchema = new Schema({
  name: {
    type: String,
  },
  subcategories: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  ],
  slug: {
    type: String,
  },
  color: {
    type: String,
    default: '#F4F6F8',
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
  opentriviadb: {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
  },
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
      color: this.color,
      subcategories: this.subcategories,
      isCustomCategory: this.isCustomCategory,
      showInFilters: this.showInFilters,
      sortOrder: this.sortOrder,
      opentriviadb: this.opentriviadb,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    return full ? {
      ...view,
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
