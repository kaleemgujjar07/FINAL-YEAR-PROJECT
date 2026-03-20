const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const productSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  isDeleted: { // Sync with removed for Ecommerce
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  title: { // Sync with name for Ecommerce
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.ObjectId, // Change to ObjectId for Ecommerce compatibility
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  stockQuantity: { // Sync with quantity for Ecommerce
    type: Number,
    default: 0,
  },
  thumbnail: {
    type: String,
  },
  images: {
    type: [String],
  },
  brand: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
});

// Pre-save hook for field synchronization (handles .create and .save)
productSchema.pre('save', function (next) {
  if (this.name) this.title = this.name;
  if (this.title) this.name = this.title;

  if (this.quantity !== undefined) this.stockQuantity = this.quantity;
  if (this.stockQuantity !== undefined) this.quantity = this.stockQuantity;

  if (this.removed !== undefined) this.isDeleted = this.removed;
  if (this.isDeleted !== undefined) this.removed = this.isDeleted;

  next();
});

// Query middleware for field synchronization (handles findOneAndUpdate)
productSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  if (update.name) update.title = update.name;
  if (update.title) update.name = update.title;

  if (update.quantity !== undefined) update.stockQuantity = update.quantity;
  if (update.stockQuantity !== undefined) update.quantity = update.stockQuantity;

  if (update.removed !== undefined) update.isDeleted = update.removed;
  if (update.isDeleted !== undefined) update.removed = update.isDeleted;

  next();
});

productSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
