import React, { useState } from 'react';
import { Play, Star, Plus, Flame, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import DishModal from './DishModal';

const MenuCard = ({ dish }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative glass-panel rounded-2xl border border-dark-700/80 hover:border-gold-500/40 bg-dark-800/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-glow hover:-translate-y-1 cursor-pointer"
      >
        {/* Card Header Media */}
        <div className="relative h-48 w-full overflow-hidden bg-dark-900">
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-black/30" />

          {/* Video Preview Tag if videoUrl exists */}
          {dish.videoUrl && (
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-gold-500/30 text-gold-400 text-[11px] font-semibold flex items-center gap-1.5 shadow-md group-hover:bg-gold-500 group-hover:text-dark-900 transition-colors">
              <Play className="w-3 h-3 fill-current" />
              <span>Video</span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-md border border-dark-600 text-gold-400 text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>{dish.rating || '4.9'}</span>
          </div>

          {/* Dietary Tag */}
          <div className="absolute bottom-3 left-3 z-10 flex gap-1.5">
            {dish.dietaryTags?.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                size="xs"
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

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-gold-400 transition-colors line-clamp-1">
              {dish.name}
            </h3>
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {dish.description}
            </p>
          </div>

          {/* Prep time & Price Footer */}
          <div className="mt-4 pt-3 border-t border-dark-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-normal">Price</span>
              <span className="text-lg font-bold text-gold-400">₹{dish.price}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-dark-700 hover:bg-gold-500 hover:text-dark-900 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 border border-dark-600 hover:border-gold-500 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dish Customization Modal */}
      <DishModal
        dish={dish}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default MenuCard;
