// src/models/MenuItem.js
import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Por favor proporciona el nombre del platillo'],
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Por favor proporciona el precio'],
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  },
  category: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);