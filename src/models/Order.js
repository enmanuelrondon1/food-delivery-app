// src/models/Order.js - VERSIÓN ACTUALIZADA
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  items: [
    {
      menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    street: String,
    lat: Number,
    lng: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash',
  },
  // 🆕 NUEVOS CAMPOS PARA STRIPE
  stripeSessionId: {
    type: String,
    default: null,
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  stripePaymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  // FIN NUEVOS CAMPOS
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  review: {
    type: String,
    default: null,
  },
  ratedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);