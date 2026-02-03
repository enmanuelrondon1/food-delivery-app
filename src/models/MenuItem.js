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
  // Soporte para imagen única (compatibilidad con datos existentes)
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  },
  // NUEVO: Array de imágenes para múltiples fotos
  images: {
    type: [String],
    default: [],
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

// Método virtual para obtener todas las imágenes (combina image + images)
MenuItemSchema.virtual('allImages').get(function() {
  const imgs = [];
  
  // Si tiene imagen principal, agregarla
  if (this.image && this.image !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800') {
    imgs.push(this.image);
  }
  
  // Agregar imágenes adicionales
  if (this.images && this.images.length > 0) {
    imgs.push(...this.images);
  }
  
  // Si no tiene ninguna imagen, retornar la imagen por defecto
  if (imgs.length === 0) {
    imgs.push('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');
  }
  
  return imgs;
});

// Asegurarse de que los virtuals se incluyan en JSON
MenuItemSchema.set('toJSON', { virtuals: true });
MenuItemSchema.set('toObject', { virtuals: true });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);