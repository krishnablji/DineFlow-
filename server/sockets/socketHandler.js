let ioInstance = null;

const initSocketHandler = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join role-specific or table-specific rooms
    socket.on('join_room', (data) => {
      const { role, tableNumber, userId } = data || {};
      
      if (role === 'waiter' || role === 'kitchen') {
        socket.join('room_kitchen');
        console.log(`Socket ${socket.id} joined room_kitchen`);
      }

      if (role === 'manager') {
        socket.join('room_manager');
        socket.join('room_kitchen');
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

    // Handle waiter manually sending milestone update
    socket.on('update_order_milestone', (data) => {
      // Broadcast to kitchen and table
      if (data && data.tableNumber) {
        io.to(`table_${data.tableNumber}`).emit('serving_status_updated', data);
      }
      io.to('room_kitchen').emit('order_milestone_changed', data);
      io.to('room_manager').emit('order_milestone_changed', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  return ioInstance;
};

// Helper emitters
const emitNewOrder = (order) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting new_order #${order.orderNumber}`);
  ioInstance.to('room_kitchen').emit('new_order', order);
  ioInstance.to('room_manager').emit('new_order', order);
  ioInstance.to(`table_${order.tableNumber}`).emit('order_placed', order);
};

const emitOrderStatusUpdate = (order) => {
  if (!ioInstance) return;
  console.log(`[Socket.io] Broadcasting order_status_updated #${order.orderNumber} -> ${order.servingStatus}`);
  ioInstance.to('room_kitchen').emit('order_status_updated', order);
  ioInstance.to('room_manager').emit('order_status_updated', order);
  ioInstance.to(`table_${order.tableNumber}`).emit('serving_status_updated', order);
  if (order.customerId) {
    ioInstance.to(`user_${order.customerId}`).emit('serving_status_updated', order);
  }
};

const emitTableStatusUpdate = (table) => {
  if (!ioInstance) return;
  ioInstance.to('room_kitchen').emit('table_status_changed', table);
  ioInstance.to('room_manager').emit('table_status_changed', table);
};

const emitStaffVerificationUpdate = (user) => {
  if (!ioInstance) return;
  ioInstance.to('room_manager').emit('staff_verification_updated', user);
  ioInstance.to(`user_${user._id}`).emit('account_verified', user);
};

module.exports = {
  initSocketHandler,
  getIO,
  emitNewOrder,
  emitOrderStatusUpdate,
  emitTableStatusUpdate,
  emitStaffVerificationUpdate,
};
