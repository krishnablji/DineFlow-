import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/apiServices';
import { useSocket } from '../../context/SocketContext';
import { Users, Utensils, CheckCircle2, Clock, QrCode } from 'lucide-react';

const TableGrid = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableApi.getTables();
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleTableStatus = (updatedTable) => {
      setTables((prev) =>
        prev.map((t) => (t.tableNumber === updatedTable.tableNumber ? updatedTable : t))
      );
    };
    socket.on('table_status_changed', handleTableStatus);
    return () => socket.off('table_status_changed', handleTableStatus);
  }, [socket]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-dark-700/80 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-100">
            Restaurant Floor Plan & Table Live Status
          </h3>
          <p className="text-xs text-slate-400">
            Real-time occupancy map for waiters & floor captains
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Occupied
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {tables.map((t) => {
          const isOccupied = t.status === 'occupied';
          return (
            <div
              key={t.tableNumber}
              className={`p-4 rounded-2xl border transition-all ${
                isOccupied
                  ? 'bg-red-500/10 border-red-500/40 shadow-glow-ruby'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl font-bold text-slate-100">
                  Table #{t.tableNumber}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOccupied ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
              </div>

              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{t.capacity} Seats</span>
                </div>
                <div className="text-[11px] text-gold-400/90 font-medium">
                  {t.section}
                </div>
                <div className="pt-1.5 font-bold uppercase text-[10px] tracking-wider text-slate-300">
                  Status: {t.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableGrid;
