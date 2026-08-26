import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { menuApi } from '../api/apiServices';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import MenuCard from '../components/customer/MenuCard';
import CartDrawer from '../components/customer/CartDrawer';
import LiveTracker from '../components/customer/LiveTracker';
import {
  Search,
  Sparkles,
  Utensils,
  Clock,
  Flame,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages'];
const DIETARY_TAGS = ['All', 'Veg', 'Vegan', 'Gluten-Free', 'Chef Special'];

const CustomerMenu = () => {
  const [searchParams] = useSearchParams();
  const { tableNumber, setTableNumber, setIsCartOpen, getTotalItemsCount } = useCartStore();
  const { activeOrder, setIsTrackerOpen } = useOrderStore();

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-sync table number from URL query param if present (e.g. ?table=4)
  useEffect(() => {
    const urlTable = searchParams.get('table');
    if (urlTable) {
      setTableNumber(Number(urlTable));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory, selectedTag, searchQuery]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedTag !== 'All') params.tag = selectedTag;
      if (searchQuery) params.search = searchQuery;

      const res = await menuApi.getMenuItems(params);
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error('Menu load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCartItems = getTotalItemsCount();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Active Order Live Tracker Bar */}
      {activeOrder && (
        <div
          onClick={() => setIsTrackerOpen(true)}
          className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-dark-800/90 shadow-glow flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-gold-500 transition-all animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">
                  Active Dine-In Order #{activeOrder.orderNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 text-[10px] font-bold uppercase">
                  {activeOrder.servingStatus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Table #{activeOrder.tableNumber} • Click to view live 4-stage serving pipeline & kitchen updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-gold-400">
            <span>View Live Tracker</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow border border-gold-500/20 p-6 sm:p-10 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Table #{tableNumber} • Gourmet Dining</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
            Artisanal Culinary Creations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Watch teaser videos of chef prep techniques, customize spice levels and gourmet add-ons, and place your order directly to our kitchen dispatch system.
          </p>
        </div>
      </div>

      {/* Filter & Category Navigation Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-dark-800/80 p-1.5 rounded-2xl border border-dark-700 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gold-500 text-dark-900 shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800/90 border border-dark-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Dietary Tag Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3 h-3 text-gold-400" />
            <span>Dietary:</span>
          </span>
          {DIETARY_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-glow-emerald'
                  : 'bg-dark-800/60 text-slate-400 border-dark-700 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-dark-800 animate-pulse" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-dark-700 space-y-3">
          <Utensils className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-300">No Dishes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or dietary filters to explore our full menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <MenuCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}

      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-sm shadow-glow flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-dark-900 text-gold-400 font-extrabold text-[10px] flex items-center justify-center border border-gold-500">
                {totalCartItems}
              </span>
            </div>
            <span>View Dine-In Order</span>
          </button>
        </div>
      )}

      {/* Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Live Tracker Modal */}
      <LiveTracker />
    </div>
  );
};

export default CustomerMenu;
