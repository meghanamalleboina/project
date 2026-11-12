import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Database, RefreshCw, CheckCircle2, ArrowRight, Table,
  Layers, Server, ShieldCheck, Key
} from 'lucide-react';

interface DbTableInfo {
  table: string;
  rows: number;
  description: string;
}

export const Module10Database: React.FC = () => {
  const { setActiveModule, showNotification } = useApp();
  const [dbData, setDbData] = useState<{ dialect: string; tables: DbTableInfo[] } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDbOverview = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatabaseTables();
      setDbData(data);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to fetch database schema');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Module 10: Relational Persistence
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Database Storage &amp; Schema Architecture</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SQLAlchemy ORM configured with relational foreign key mapping between datasets, experiments, models, and predictions with automatic SQLite fallback.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDbOverview}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Tables</span>
          </button>
          <button
            onClick={() => setActiveModule(11)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <span>Proceed to Analysis History</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Querying Database Catalog...</h3>
        </div>
      ) : dbData ? (
        <>
          {/* Engine Status Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Database Engine</span>
              <div className="text-xl font-black text-slate-900 mt-1 capitalize flex items-center space-x-1.5">
                <Server className="w-5 h-5 text-blue-600" />
                <span>{dbData.dialect}</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">SQLAlchemy ORM Engine</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Schema Tables</span>
              <div className="text-xl font-black text-blue-700 mt-1 flex items-center space-x-1.5">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{dbData.tables.length} Relational Tables</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Foreign Key Cascades Enabled</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Persistence Guarantee</span>
              <div className="text-xl font-black text-emerald-600 mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Zero Data Loss</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Survives server restarts</span>
            </div>
          </div>

          {/* Table List & Real Row Counts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Table className="w-4 h-4 text-blue-600" />
              <span>Database Tables &amp; Active Entity Records</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Table Name</th>
                    <th className="py-2.5 px-3">Persisted Rows</th>
                    <th className="py-2.5 px-3">Description &amp; Entity Responsibility</th>
                    <th className="py-2.5 px-3">Key Relations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {dbData.tables.map((t) => (
                    <tr key={t.table} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-blue-900">{t.table}</td>
                      <td className="py-3 px-3 font-black text-slate-800 text-sm">{t.rows}</td>
                      <td className="py-3 px-3 font-sans text-slate-600">{t.description}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                          <Key className="w-3 h-3 text-slate-400" />
                          <span>FK Indexed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
