import React, { useEffect, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { tableApi } from '../../api/apiServices';
import { QrCode, Users, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

const TableSelectModal = ({ isOpen, onClose }) => {
  const { tableNumber, setTableNumber } = useCartStore();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(tableNumber);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTables();
    }
  }, [isOpen]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableApi.getTables();
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
      // Fallback default 8 tables
      setTables([
        { tableNumber: 1, capacity: 2, section: 'Main Dining', status: 'available' },
        { tableNumber: 2, capacity: 4, section: 'Main Dining', status: 'available' },
        { tableNumber: 3, capacity: 4, section: 'Main Dining', status: 'available' },
        { tableNumber: 4, capacity: 6, section: 'Private Booth', status: 'available' },
        { tableNumber: 5, capacity: 2, section: 'Patio Terrace', status: 'available' },
        { tableNumber: 6, capacity: 4, section: 'Patio Terrace', status: 'available' },
        { tableNumber: 7, capacity: 8, section: 'Rooftop Lounge', status: 'available' },
        { tableNumber: 8, capacity: 6, section: 'Rooftop Lounge', status: 'available' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (num) => {
    setSelectedTable(num);
  };

  const handleConfirm = () => {
    setTableNumber(selectedTable);
    onClose();
  };

  const handleViewQR = async (tNum, e) => {
    e.stopPropagation();
    try {
      const res = await tableApi.getTableQRCode(tNum);
      if (res.data.success) {
        setQrData(res.data);
        setShowQR(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={showQR ? `Table #${qrData?.tableNumber} Digital QR Code` : 'Select Dine-In Table'}
      maxWidth="max-w-2xl"
    >
      {showQR ? (
        <div className="flex flex-col items-center text-center p-4">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-gold-500/40 mb-4">
            <img
              src={qrData?.qrCodeImage}
              alt={`Table ${qrData?.tableNumber} QR Code`}
              className="w-56 h-56 object-contain"
            />
          </div>
          <p className="text-sm text-slate-300 font-medium max-w-sm mb-6">
            Scan with your mobile camera to instantly access the live interactive menu synchronized with Table #{qrData?.tableNumber}.
          </p>
          <button
            onClick={() => setShowQR(false)}
            className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm transition-all"
          >
            Back to Table List
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Select a table or click QR to view table code:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Occupied</span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-dark-700/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {tables.map((t) => {
                const isSelected = selectedTable === t.tableNumber;
                return (
                  <div
                    key={t.tableNumber}
                    onClick={() => handleSelectTable(t.tableNumber)}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gold-500/20 border-gold-500 shadow-glow'
                        : 'bg-dark-700/60 border-dark-600 hover:border-slate-500 hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-100">
                        Table {t.tableNumber}
                      </span>
                      <button
                        onClick={(e) => handleViewQR(t.tableNumber, e)}
                        className="p-1 rounded bg-dark-800 text-slate-400 hover:text-gold-400 transition-colors"
                        title="View QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>Up to {t.capacity} Guests</span>
                      </div>
                      <div className="text-[10px] text-gold-400/80 font-medium">
                        {t.section}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-xs shadow-glow transition-all"
            >
              Confirm Table #{selectedTable}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TableSelectModal;
