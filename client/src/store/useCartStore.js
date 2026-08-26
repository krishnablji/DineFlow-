import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: 4, // Default Demo Table
      scheduledTime: 'Immediate',
      specialInstructions: '',
      isCartOpen: false,

      setTableNumber: (tableNumber) => set({ tableNumber: Number(tableNumber) }),
      setScheduledTime: (scheduledTime) => set({ scheduledTime }),
      setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      addItem: (dish, customization = {}) => {
        const { spiceLevel = 'Medium', addons = [], specialNotes = '', quantity = 1 } = customization;
        
        const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
        const itemUnitPrice = dish.price + addonTotal;
        const itemTotal = itemUnitPrice * quantity;

        // Create a unique cart item key based on dish ID + customized addons + spice
        const addonKey = addons.map((a) => a.name).sort().join('-');
        const cartItemId = `${dish._id}_${spiceLevel}_${addonKey}`;

        const existingIndex = get().items.findIndex((item) => item.cartItemId === cartItemId);

        if (existingIndex > -1) {
          const updated = [...get().items];
          updated[existingIndex].quantity += quantity;
          updated[existingIndex].itemTotal = updated[existingIndex].quantity * itemUnitPrice;
          set({ items: updated, isCartOpen: true });
        } else {
          set({
            items: [
              ...get().items,
              {
                cartItemId,
                menuItemId: dish._id,
                name: dish.name,
                price: dish.price,
                imageUrl: dish.imageUrl,
                quantity,
                spiceLevel,
                addons,
                specialInstructions: specialNotes,
                unitPrice: itemUnitPrice,
                itemTotal,
              },
            ],
            isCartOpen: true,
          });
        }
      },

      updateQuantity: (cartItemId, newQty) => {
        if (newQty <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        const updated = get().items.map((item) => {
          if (item.cartItemId === cartItemId) {
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.unitPrice,
            };
          }
          return item;
        });
        set({ items: updated });
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter((item) => item.cartItemId !== cartItemId),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.itemTotal, 0);
      },

      getTaxes: () => {
        return Math.round(get().getSubtotal() * 0.05); // 5% GST
      },

      getServiceFee: () => {
        return Math.round(get().getSubtotal() * 0.02); // 2% Service charge
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getTaxes() + get().getServiceFee();
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'dineflow-cart-storage',
    }
  )
);
