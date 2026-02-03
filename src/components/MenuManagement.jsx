// src/components/MenuManagement.jsx
'use client';

import { useState, useEffect } from 'react';

export default function MenuManagement({ restaurantId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    images: [],
    category: '',
    available: true,
  });
  
  // Estado para el input de nueva URL de imagen
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setError('');
      const res = await fetch(`/api/menu?restaurantId=${restaurantId}`);
      
      if (!res.ok) {
        throw new Error('Error al cargar el menú');
      }
      
      const data = await res.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error obteniendo menú:', error);
      setError('No se pudo cargar el menú. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          restaurantId,
          price: parseFloat(formData.price),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar item');
      }

      await fetchMenuItems();
      resetForm();
      
      alert(editingItem ? 'Item actualizado exitosamente' : 'Item agregado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    
    // Preparar las imágenes para edición
    const itemImages = [];
    
    // Si tiene array de images, usarlo
    if (item.images && item.images.length > 0) {
      itemImages.push(...item.images);
    } else if (item.image && item.image !== 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800') {
      // Si solo tiene image (legacy), agregarlo como primera imagen
      itemImages.push(item.image);
    }
    
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: item.image || '',
      images: itemImages,
      category: item.category,
      available: item.available,
    });
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este item del menú?')) return;

    try {
      setError('');
      const res = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar');
      }

      await fetchMenuItems();
      alert('Item eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      setError('');
      const res = await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          available: !item.available,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar disponibilidad');
      }

      await fetchMenuItems();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  // NUEVO: Agregar imagen al array
  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      alert('Por favor ingresa una URL de imagen');
      return;
    }
    
    // Validar que sea una URL válida
    try {
      new URL(newImageUrl);
    } catch (e) {
      alert('Por favor ingresa una URL válida');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
      // Si es la primera imagen, también establecerla como imagen principal
      image: prev.images.length === 0 ? newImageUrl.trim() : prev.image
    }));
    setNewImageUrl('');
  };

  // NUEVO: Eliminar imagen del array
  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        // Si se elimina la primera imagen, actualizar la imagen principal
        image: newImages.length > 0 ? newImages[0] : ''
      };
    });
  };

  // NUEVO: Mover imagen hacia arriba
  const handleMoveImageUp = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return {
        ...prev,
        images: newImages,
        image: newImages[0] // La primera siempre es la principal
      };
    });
  };

  // NUEVO: Mover imagen hacia abajo
  const handleMoveImageDown = (index) => {
    if (index === formData.images.length - 1) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return {
        ...prev,
        images: newImages,
        image: newImages[0] // La primera siempre es la principal
      };
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      images: [],
      category: '',
      available: true,
    });
    setNewImageUrl('');
    setEditingItem(null);
    setShowForm(false);
    setError('');
  };

  const categories = [
    'Pizzas',
    'Pastas',
    'Hamburguesas',
    'Tacos',
    'Burritos',
    'Quesadillas',
    'Rolls',
    'Sushi',
    'Sashimi',
    'Entradas',
    'Platos Principales',
    'Platos Típicos',
    'Acompañantes',
    'Postres',
    'Bebidas',
    'Ensaladas',
    'Sopas',
    'Café',
    'Parrillas',
    'Carnes',
    'Pollo',
    'Mariscos',
    'Vegetariano',
    'Vegano',
    'Otro',
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando menú...</p>
      </div>
    );
  }

  // Agrupar items por categoría
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Componente para mostrar imágenes en tarjeta
  const ItemImageGallery = ({ item }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Obtener todas las imágenes del item
    const images = [];
    if (item.images && item.images.length > 0) {
      images.push(...item.images);
    } else if (item.image) {
      images.push(item.image);
    }
    
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800');
    }

    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="relative group">
        <img
          src={images[currentImageIndex]}
          alt={item.name}
          className="w-full h-32 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
          }}
        />
        
        {images.length > 1 && (
          <>
            {/* Indicadores de imagen */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
            
            {/* Botones de navegación */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ›
            </button>
            
            {/* Contador */}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mensajes de error globales */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Botón para agregar item */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestión del Menú ({menuItems.length} items)
        </h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) resetForm();
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          {showForm ? 'Cancelar' : '+ Agregar Item'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingItem ? 'Editar Item' : 'Nuevo Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Platillo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ej: Pizza Margarita"
                  disabled={saving}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="9.99"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe los ingredientes y características"
                rows="2"
                disabled={saving}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* NUEVO: Gestor de Múltiples Imágenes */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📸 Imágenes del Platillo ({formData.images.length})
              </label>
              
              {/* Input para agregar nueva imagen */}
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://images.unsplash.com/..."
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={saving}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  + Agregar
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mb-4">
                Puedes buscar imágenes en{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:underline"
                >
                  Unsplash.com
                </a>
                . La primera imagen será la principal.
              </p>

              {/* Lista de imágenes agregadas */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  {formData.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      {/* Preview de la imagen */}
                      <img
                        src={imageUrl}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
                        }}
                      />
                      
                      {/* URL (truncada) */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          {imageUrl}
                        </p>
                        {index === 0 && (
                          <span className="text-xs text-orange-500 font-semibold">
                            ⭐ Imagen Principal
                          </span>
                        )}
                      </div>
                      
                      {/* Botones de control */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImageUp(index)}
                          disabled={index === 0 || saving}
                          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover arriba"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImageDown(index)}
                          disabled={index === formData.images.length - 1 || saving}
                          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover abajo"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          disabled={saving}
                          className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.images.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No hay imágenes agregadas</p>
                  <p className="text-xs">Agrega al menos una imagen para tu platillo</p>
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                disabled={saving}
              />
              <label
                htmlFor="available"
                className="ml-3 text-sm font-semibold text-gray-700"
              >
                Item disponible para ordenar
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={saving || formData.images.length === 0}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : editingItem ? 'Actualizar Item' : 'Agregar Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de items agrupados por categoría */}
      {menuItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4 text-lg">No hay items en el menú aún</p>
          <p className="text-gray-500 mb-6 text-sm">
            Comienza agregando tus primeros platillos
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            + Agregar Primer Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(itemsByCategory)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <div key={category}>
                <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-orange-200 pb-2 flex items-center justify-between">
                  <span>{category} ({items.length})</span>
                  <span className="text-sm text-gray-500 font-normal">
                    {items.filter(i => i.available).length} disponibles
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className={`border rounded-lg p-4 hover:shadow-lg transition ${
                        !item.available ? 'opacity-60 bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Galería de imágenes */}
                      <ItemImageGallery item={item} />
                      
                      <div className="flex items-start justify-between mb-2 mt-3">
                        <h4 className="font-semibold text-gray-900 flex-1">
                          {item.name}
                        </h4>
                        {!item.available && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold ml-2">
                            No disponible
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <p className="text-lg font-bold text-orange-500 mb-3">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`w-full px-3 py-2 rounded text-sm font-semibold transition ${
                            item.available
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {item.available ? '🚫 Marcar No Disponible' : '✅ Marcar Disponible'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}