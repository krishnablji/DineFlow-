import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import {
  X,
  Play,
  Pause,
  Flame,
  Plus,
  Minus,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Badge from '../common/Badge';

const DishModal = ({ dish, isOpen, onClose }) => {
  const { addItem } = useCartStore();

  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [selectedSpice, setSelectedSpice] = useState(dish?.spiceLevels?.[0] || 'Medium');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !dish) return null;

  const toggleAddon = (addon) => {
    const exists = selectedAddons.some((a) => a.name === addon.name);
    if (exists) {
      setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = dish.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem(dish, {
      spiceLevel: selectedSpice,
      addons: selectedAddons,
      specialNotes,
      quantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] glass-panel-glow rounded-3xl border border-gold-500/20 bg-dark-800 text-slate-100 shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header Media (Video / Image) */}
        <div className="relative h-64 sm:h-72 w-full bg-dark-900 overflow-hidden flex-shrink-0">
          {isPlayingVideo && dish.videoUrl ? (
            <video
              src={dish.videoUrl}
              autoPlay
              controls
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-black/50 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-dark-900/80 text-white hover:bg-gold-500 hover:text-dark-900 transition-all z-20 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Video Play Toggle Badge if dish has videoUrl */}
          {dish.videoUrl && (
            <button
              onClick={() => setIsPlayingVideo(!isPlayingVideo)}
              className="absolute bottom-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-gold-500 hover:text-dark-900 text-gold-400 text-xs font-semibold backdrop-blur-md border border-gold-500/30 flex items-center gap-2 transition-all group shadow-lg"
            >
              {isPlayingVideo ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Chef Video</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current group-hover:animate-ping" />
                  <span>Watch Chef Prep Teaser</span>
                </>
              )}
            </button>
          )}

          {/* Prep time badge */}
          <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-dark-900/80 text-slate-300 text-xs font-medium backdrop-blur-md border border-dark-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-400" />
            <span>~{dish.preparationTimeMinutes || 15} mins prep</span>
          </div>
        </div>

        {/* Scrollable Dish Customizations Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 className="font-serif text-2xl font-bold text-slate-100 tracking-wide">
                {dish.name}
              </h2>
              <span className="text-2xl font-bold text-gold-400 font-sans">
                ₹{dish.price}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {dish.description}
            </p>

            {/* Dietary Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {dish.dietaryTags?.map((tag) => (
                <Badge
                  key={tag}
                  variant={
                    tag === 'Veg' || tag === 'Vegan'
                      ? 'emerald'
                      : tag === 'Chef Special'
                      ? 'gold'
                      : 'default'
                  }
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Spice Level Selector */}
          {dish.spiceLevels && dish.spiceLevels.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-dark-700">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>Choose Spice Level:</span>
                </label>
                <span className="text-xs text-gold-400 font-medium">{selectedSpice}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dish.spiceLevels.map((lvl) => {
                  const isSelected = selectedSpice === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedSpice(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSelected
                          ? 'bg-red-500/20 text-red-300 border-red-500 shadow-glow-ruby'
                          : 'bg-dark-700/60 text-slate-400 border-dark-600 hover:border-slate-500 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gourmet Addons & Toppings */}
          {dish.customizations && dish.customizations.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-dark-700">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Gourmet Add-ons & Toppings (Optional):</span>
              </label>
              <div className="space-y-2">
                {dish.customizations.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <div
                      key={addon.name}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-gold-500/10 border-gold-500/50 text-slate-100'
                          : 'bg-dark-700/40 border-dark-600/70 text-slate-300 hover:bg-dark-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-gold-500 border-gold-500 text-dark-900'
                              : 'border-dark-500 bg-dark-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gold-400">
                        +₹{addon.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2 pt-2 border-t border-dark-700">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Special Chef Instructions / Allergies:
            </label>
            <input
              type="text"
              placeholder="e.g. Less oil, no onions, extra crispy, etc."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full bg-dark-900/80 border border-dark-600 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer Quantity & Add-to-Cart bar */}
        <div className="p-4 sm:p-6 bg-dark-900 border-t border-dark-700/80 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-dark-800 border border-dark-600 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-slate-100 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-sm shadow-glow transition-all flex items-center justify-between"
          >
            <span>Add to Dine-In Order</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishModal;
