import React, { useEffect, useState } from 'react';
import { menuApi } from '../../api/apiServices';
import {
  Plus,
  Edit2,
  Trash2,
  Image,
  Video,
  Upload,
  CheckCircle,
  X,
  Sparkles,
  Flame,
  Search,
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

const MenuStudio = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mains');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [dietaryTags, setDietaryTags] = useState(['Veg']);
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState('15');

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const res = await menuApi.getMenuItems();
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const openNewDishModal = () => {
    setEditingDish(null);
    setName('');
    setCategory('Mains');
    setPrice('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
    setVideoUrl('');
    setDietaryTags(['Veg']);
    setIsAvailable(true);
    setPrepTime('15');
    setIsEditModalOpen(true);
  };

  const openEditDishModal = (dish) => {
    setEditingDish(dish);
    setName(dish.name);
    setCategory(dish.category);
    setPrice(dish.price);
    setDescription(dish.description);
    setImageUrl(dish.imageUrl);
    setVideoUrl(dish.videoUrl || '');
    setDietaryTags(dish.dietaryTags || []);
    setIsAvailable(dish.isAvailable);
    setPrepTime(dish.preparationTimeMinutes || '15');
    setIsEditModalOpen(true);
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      category,
      price: Number(price),
      description,
      imageUrl,
      videoUrl,
      dietaryTags,
      isAvailable,
      preparationTimeMinutes: Number(prepTime),
    };

    try {
      if (editingDish) {
        const res = await menuApi.updateMenuItem(editingDish._id, payload);
        if (res.data.success) {
          setDishes((prev) =>
            prev.map((d) => (d._id === editingDish._id ? res.data.data : d))
          );
        }
      } else {
        const res = await menuApi.createMenuItem(payload);
        if (res.data.success) {
          setDishes((prev) => [res.data.data, ...prev]);
        }
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to save dish:', err);
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to remove this dish from the active menu?')) return;
    try {
      await menuApi.deleteMenuItem(id);
      setDishes((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTag = (tag) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const filteredDishes = dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="glass-panel p-5 rounded-2xl border border-dark-700 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-100">
            Menu Studio & Chef Recipe Catalog
          </h3>
          <p className="text-xs text-slate-400">
            Manage dishes, multimedia teaser videos, pricing, and stock status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-dark-900 border border-dark-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <button
            onClick={openNewDishModal}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Dish</span>
          </button>
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => (
          <div
            key={dish._id}
            className="glass-panel rounded-2xl border border-dark-700/80 bg-dark-900/60 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-44 w-full">
              <img
                src={dish.imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/30" />
              <div className="absolute top-3 left-3">
                <Badge variant="gold" size="xs">
                  {dish.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => openEditDishModal(dish)}
                  className="p-1.5 rounded-lg bg-dark-900/80 hover:bg-gold-500 hover:text-dark-900 text-slate-300 transition-colors"
                  title="Edit Dish"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteDish(dish._id)}
                  className="p-1.5 rounded-lg bg-dark-900/80 hover:bg-red-500 text-slate-300 transition-colors"
                  title="Delete Dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-slate-100 line-clamp-1">
                  {dish.name}
                </h4>
                <span className="text-sm font-bold text-gold-400">₹{dish.price}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{dish.description}</p>
              
              <div className="flex flex-wrap gap-1 pt-1">
                {dish.dietaryTags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-dark-800 text-[10px] text-slate-400 border border-dark-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Dish Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingDish ? `Edit "${editingDish.name}"` : 'Add Gourmet Dish to Menu'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveDish} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Dish Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Truffle Infused Risotto"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Menu Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              >
                <option value="Starters">Starters</option>
                <option value="Mains">Mains</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 550"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Estimated Prep Time (mins)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="15"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows="3"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sensory description of dish, origin of ingredients..."
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Chef Video Teaser URL (Optional)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://... (mp4/webm)"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Dietary Tags Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Dietary Badges</label>
            <div className="flex flex-wrap gap-2">
              {['Veg', 'Vegan', 'Gluten-Free', 'Non-Veg', 'Chef Special'].map((tag) => {
                const isSelected = dietaryTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-gold-500 text-dark-900 border-gold-500'
                        : 'bg-dark-900 border-dark-600 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-xs shadow-glow transition-all"
            >
              {editingDish ? 'Save Changes' : 'Publish Dish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuStudio;
