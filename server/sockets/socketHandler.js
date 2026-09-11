let ioInstance = null;

const initSocketHandler = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join role-specific or table-specific rooms
    socket.on('join_room', (data) => {
      const { role, tableNumber, userId } = data || {};

      if (role === 'waiter') {
        socket.join('room_waiters');
        console.log(`Socket ${socket.id} joined room_waiters`);
      }

      if (role === 'kitchen') {
        socket.join('room_kitchen');
        console.log(`Socket ${socket.id} joined room_kitchen`);
      }

      if (role === 'manager') {
        socket.join('room_manager');
        socket.join('room_kitchen');
        socket.join('room_waiters');
        console.log(`Socket ${socket.id} joined room_manager`);
      }

      if (tableNumber) {
        socket.join(`table_${tableNumber}`);
        console.log(`Socket ${socket.id} joined table_${tableNumber}`);
      }

      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  return ioInstance;
};

// Broadcast new order to Kitchen Display & Manager
const emitNewOrder = (order) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting new_order #${order.orderNumber}`);
  ioInstance.to('room_kitchen').emit('new_order', order);
  ioInstance.to('room_manager').emit('new_order', order);
  ioInstance.to(`table_${order.tableNumber}`).emit('order_placed', order);
};

// Broadcast when Kitchen marks an order as Ready / Start Delivery
const emitOrderReady = (order) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting order_ready #${order.orderNumber}`);
  // Alert all waiters so any available waiter can deliver the plate
  ioInstance.to('room_waiters').emit('order_ready', order);
  ioInstance.to('room_manager').emit('order_ready', order);
  ioInstance.to('room_kitchen').emit('order_status_updated', order);
  ioInstance.to(`table_${order.tableNumber}`).emit('serving_status_updated', order);
};

// Broadcast when an order is settled/paid
const emitOrderSettled = (order) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting order_settled #${order.orderNumber}`);
  ioInstance.to('room_manager').emit('order_settled', order);
  ioInstance.to('room_waiters').emit('order_settled', order);
  ioInstance.to('room_kitchen').emit('order_settled', order);
};

// Broadcast out-of-stock (Item 86) or restock events to ALL tablets
const emitItemStockUpdate = (payload) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting item_stock_updated:`, payload);
  ioInstance.to('room_waiters').emit('item_stock_updated', payload);
  ioInstance.to('room_kitchen').emit('item_stock_updated', payload);
  ioInstance.to('room_manager').emit('item_stock_updated', payload);
};

module.exports = {
  initSocketHandler,
  getIO,
  emitNewOrder,
  emitOrderReady,
  emitOrderSettled,
  emitItemStockUpdate,
};
