import React, { useEffect, useState } from 'react';
import { userApi } from '../../api/apiServices';
import { useSocket } from '../../context/SocketContext';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCheck,
  Mail,
  Phone,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const StaffVettingQueue = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await userApi.getStaffList();
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleStaffUpdate = () => {
      fetchStaff();
    };
    socket.on('staff_verification_updated', handleStaffUpdate);
    return () => socket.off('staff_verification_updated', handleStaffUpdate);
  }, [socket]);

  const handleVerify = async (userId, isVerified) => {
    try {
      const res = await userApi.updateStaffVerification(userId, {
        isVerified,
        assignedTables: isVerified ? [1, 2, 3, 4, 5, 6, 7, 8] : [],
      });
      if (res.data.success) {
        setStaffList((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, isVerified, assignedTables: [1, 2, 3, 4, 5, 6, 7, 8] } : u
          )
        );
      }
    } catch (err) {
      console.error('Failed to update verification:', err);
    }
  };

  const pendingWaiters = staffList.filter((s) => s.role === 'waiter' && !s.isVerified);
  const activeStaff = staffList.filter((s) => s.isVerified);

  return (
    <div className="space-y-6">
      {/* Pending Vetting Queue Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-gold-500/30 bg-dark-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-100">
                Staff Vetting & Verification Queue
              </h3>
              <p className="text-xs text-slate-400">
                Newly registered waiter accounts require manager clearance before accessing kitchen dispatch boards
              </p>
            </div>
          </div>
          <button
            onClick={fetchStaff}
            className="p-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Pending Waiter Cards */}
        {pendingWaiters.length === 0 ? (
          <div className="p-6 rounded-xl bg-dark-900/60 border border-dark-700 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">All Staff Applications Cleared!</p>
            <p className="text-slate-500 mt-0.5">No new waiters currently waiting in the verification queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingWaiters.map((waiter) => (
              <div
                key={waiter._id}
                className="p-4 rounded-xl bg-dark-900 border border-gold-500/40 space-y-3 shadow-glow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={waiter.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'}
                    alt={waiter.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gold-500/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{waiter.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Mail className="w-3 h-3 text-gold-400" />
                      <span>{waiter.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-dark-700">
                  <button
                    onClick={() => handleVerify(waiter._id, false)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify(waiter._id, true)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-dark-900 text-xs font-bold shadow-glow-emerald transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Waiter</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Verified Staff Table */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <span>Active & Verified Staff Directory</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-700 text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Staff Member</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned Tables</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60">
              {activeStaff.map((staff) => (
                <tr key={staff._id} className="hover:bg-dark-700/30">
                  <td className="py-3 flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-200">{staff.name}</div>
                      <div className="text-[11px] text-slate-500">{staff.email}</div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full bg-dark-700 text-slate-300 font-medium capitalize">
                      {staff.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {staff.assignedTables?.length > 0
                      ? `Tables: ${staff.assignedTables.join(', ')}`
                      : 'All Tables'}
                  </td>
                  <td className="py-3 text-right">
                    {staff.email !== 'admin@dineflow.com' && (
                      <button
                        onClick={() => handleVerify(staff._id, false)}
                        className="text-red-400 hover:text-red-300 text-[11px] font-semibold"
                      >
                        Revoke Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffVettingQueue;
