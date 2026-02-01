// src/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor proporciona un nombre'],
  },
  email: {
    type: String,
    required: [true, 'Por favor proporciona un email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      // Password solo es requerido si NO es login con Google
      return this.provider !== 'google';
    },
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant'],
    default: 'customer',
  },
  // 🆕 NUEVOS CAMPOS PARA GOOGLE OAUTH
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
  googleId: {
    type: String,
    default: null,
  },
  // FIN NUEVOS CAMPOS
  phone: {
    type: String,
  },
  address: {
    street: String,
    lat: Number,
    lng: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);