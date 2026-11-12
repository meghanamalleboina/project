import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Upload, FileText, CheckCircle2, ArrowRight, Table, Sparkles, AlertCircle, BarChart3 } from 'lucide-react';

export const Module1Upload: React.FC = () => {
  const { activeDataset, setActiveDataset, showNotification, setActiveModule, loadSample, isLoadingSample } = useApp();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      showNotification('error', 'Only CSV files (.csv) are supported.');
      return;
    }
    setIsUploading(true);
    try {
      const ds = await api.uploadCSV(file);
      setActiveDataset(ds);
      showNotification('success', `Dataset "${ds.original_name}" uploaded successfully! (${ds.row_count} rows, ${ds.col_count} columns)`);
    } catch (err: any) {
      showNotification('error', err.message || 'CSV upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 border border-white/20 uppercase tracking-wider">
            Module 1: Ingestion &amp; Schema Profiling
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">CSV Dataset Upload &amp; Exploration</h2>
          <p className="text-blue-100 text-sm mt-1 leading-relaxed">
            Upload your raw CSV data or select from pre-configured engineering test datasets. NexaDS dynamically parses headers, verifies column datatypes, isolates numerical from categorical features, and prepares data for pipeline execution.
          </p>
        </div>
      </div>

      {/* Upload Zone & Quick Samples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Dropzone */}
        <div className="lg:col-span-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white flex flex-col items-center justify-center min-h-[220px] ${
              isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Drag and drop your CSV file here</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Supports standard comma-separated tabular files up to 100MB with automated header parsing.
            </p>
            <div className="mt-4 flex items-center space-x-3">
              <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>{isUploading ? 'Uploading & Parsing...' : 'Browse CSV File'}</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Built-in Synthetic Test Datasets</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select one of the verified engineering benchmarks to test the complete 13-module pipeline instantly:
            </p>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => loadSample('churn')}
                disabled={isLoadingSample}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Customer Churn Dataset</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono">Classification</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">250 rows, 7 cols (tenure, charges, tickets, churn)</div>
              </button>

              <button
                onClick={() => loadSample('housing')}
                disabled={isLoadingSample}
                className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                  <span>Housing Prices Dataset</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-mono">Regression</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">300 rows, 6 cols (sqft, bedrooms, age, sale_price)</div>
              </button>

              <button
                onClick={() => loadSample('quality_stress')}
                disabled={isLoadingSample}
                className="w-full text-left p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-amber-700 flex items-center justify-between">
                  <span>Quality Stress Test Dataset</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono">Stress Audit</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Missing values, duplicates, constant cols, outliers</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Metadata & Column Summary */}
      {activeDataset && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{activeDataset.original_name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">ID: {activeDataset.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">File ready for quality inspection and automated ML pipelines.</p>
            </div>

            <button
              onClick={() => setActiveModule(2)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <span>Next: Detect Dataset Mistakes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Total Rows</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{activeDataset.row_count.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Total Columns</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{activeDataset.col_count}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Numerical Features</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {activeDataset.columns_meta.filter((c) => c.is_numerical).length}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Categorical Features</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {activeDataset.columns_meta.filter((c) => c.is_categorical).length}
              </div>
            </div>
          </div>

          {/* Column Metadata Schema Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Table className="w-3.5 h-3.5 text-blue-600" />
              <span>Detected Feature Schema &amp; Data Profiling</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Missing Cells</th>
                    <th className="py-2.5 px-3">Unique Values</th>
                    <th className="py-2.5 px-3">Sample Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeDataset.columns_meta.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">{col.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{col.dtype}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            col.is_numerical
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {col.is_numerical ? 'Numerical' : 'Categorical'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {col.null_count > 0 ? (
                          <span className="text-amber-600 font-semibold">{col.null_count} nulls</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">0 nulls</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{col.unique_count}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                        {col.sample_values.slice(0, 3).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Dataset Preview Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Dataset Preview (First 10 Rows)</span>
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    {activeDataset.columns_meta.map((c) => (
                      <th key={c.name} className="py-2 px-3 whitespace-nowrap">{c.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeDataset.preview.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30">
                      <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                      {activeDataset.columns_meta.map((c) => (
                        <td key={c.name} className="py-2 px-3 text-slate-800 whitespace-nowrap">
                          {row[c.name] === null ? (
                            <span className="text-amber-500 font-semibold italic">NaN</span>
                          ) : (
                            String(row[c.name])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
