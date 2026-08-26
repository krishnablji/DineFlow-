import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set) => ({
      activeOrder: null,
      isTrackerOpen: false,

      setActiveOrder: (order) => set({ activeOrder: order, isTrackerOpen: true }),
      setIsTrackerOpen: (isOpen) => set({ isTrackerOpen: isOpen }),

      updateOrderStatus: (status, updatedOrder = null) =>
        set((state) => ({
          activeOrder: updatedOrder
            ? updatedOrder
            : state.activeOrder
            ? { ...state.activeOrder, servingStatus: status }
            : null,
        })),

      clearActiveOrder: () => set({ activeOrder: null, isTrackerOpen: false }),
    }),
    {
      name: 'dineflow-active-order',
    }
  )
);
