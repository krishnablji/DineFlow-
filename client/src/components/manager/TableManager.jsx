import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/apiServices';
import { Plus, QrCode, Download, Eye, Users, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';

const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [section, setSection] = useState('Main Dining');
  const [qrModalData, setQrModalData] = useState(null);

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

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const res = await tableApi.createTable({
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
        section,
      });
      if (res.data.success) {
        setTables((prev) => [...prev, res.data.data]);
        setIsAddModalOpen(false);
        setTableNumber('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create table');
    }
  };

  const handleViewQR = async (tNum) => {
    try {
      const res = await tableApi.getTableQRCode(tNum);
      if (res.data.success) {
        setQrModalData(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl border border-dark-700 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-100">
            Dining Tables & Smart QR Code Dispatch
          </h3>
          <p className="text-xs text-slate-400">
            Configure restaurant floor tables, capacity limits, and download QR codes for physical table cards
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-900 font-bold text-xs rounded-xl shadow-glow transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dining Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((t) => (
          <div
            key={t.tableNumber}
            className="glass-panel p-5 rounded-2xl border border-dark-700/80 bg-dark-900/60 space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-slate-100">
                Table #{t.tableNumber}
              </span>
              <span className="px-2 py-0.5 rounded bg-dark-800 text-[10px] text-gold-400 font-semibold border border-dark-700">
                {t.section}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{t.capacity} Seat Capacity</span>
              </div>
              <div>Status: <span className="capitalize font-bold text-emerald-400">{t.status}</span></div>
            </div>

            <button
              onClick={() => handleViewQR(t.tableNumber)}
              className="w-full py-2 bg-dark-800 hover:bg-gold-500 hover:text-dark-900 text-slate-300 font-semibold text-xs rounded-xl border border-dark-700 transition-all flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>View / Download QR</span>
            </button>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {qrModalData && (
        <Modal
          isOpen={!!qrModalData}
          onClose={() => setQrModalData(null)}
          title={`Table #${qrModalData.tableNumber} QR Code`}
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-gold-500/40 mb-4">
              <img
                src={qrModalData.qrCodeImage}
                alt={`Table ${qrModalData.tableNumber} QR`}
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {qrModalData.qrUrl}
            </p>
            <a
              href={qrModalData.qrCodeImage}
              download={`table-${qrModalData.tableNumber}-qr.png`}
              className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-xs transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Printable QR Image</span>
            </a>
          </div>
        </Modal>
      )}

      {/* Add Table Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Dining Table"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateTable} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Table Number</label>
            <input
              type="number"
              required
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. 9"
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Seating Capacity</label>
            <input
              type="number"
              required
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="4"
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Dining Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-gold-500"
            >
              <option value="Main Dining">Main Dining</option>
              <option value="Patio Terrace">Patio Terrace</option>
              <option value="Rooftop Lounge">Rooftop Lounge</option>
              <option value="Private Booth">Private Booth</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-xs shadow-glow transition-all"
            >
              Add Table
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TableManager;
