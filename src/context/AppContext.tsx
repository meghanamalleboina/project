import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dataset, Experiment, TrainedModelSummary, ExperimentHistoryItem } from '../types';
import { api } from '../services/api';

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activeModule: number;
  setActiveModule: (mod: number) => void;
  activeDataset: Dataset | null;
  setActiveDataset: (ds: Dataset | null) => void;
  activeExperiment: Experiment | null;
  setActiveExperiment: (exp: Experiment | null) => void;
  activeModel: TrainedModelSummary | null;
  setActiveModel: (m: TrainedModelSummary | null) => void;
  historyList: ExperimentHistoryItem[];
  refreshHistory: () => Promise<void>;
  notification: NotificationState | null;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;
  dbHealthy: boolean;
  loadSample: (type: 'churn' | 'housing' | 'quality_stress') => Promise<void>;
  isLoadingSample: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [activeModel, setActiveModel] = useState<TrainedModelSummary | null>(null);
  const [historyList, setHistoryList] = useState<ExperimentHistoryItem[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [dbHealthy, setDbHealthy] = useState<boolean>(true);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  const clearNotification = () => setNotification(null);

  const refreshHistory = async () => {
    try {
      const data = await api.listExperiments();
      setHistoryList(data);
    } catch (err) {
      console.warn('Failed to refresh history:', err);
    }
  };

  const loadSample = async (type: 'churn' | 'housing' | 'quality_stress') => {
    setIsLoadingSample(true);
    try {
      const ds = await api.loadSampleDataset(type);
      setActiveDataset(ds);
      showNotification('success', `Loaded sample dataset: ${ds.original_name} (${ds.row_count} rows, ${ds.col_count} columns)`);
      setActiveModule(1); // Go to Upload & Preview
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to load sample dataset');
    } finally {
      setIsLoadingSample(false);
    }
  };

  useEffect(() => {
    api.getHealth()
      .then(() => setDbHealthy(true))
      .catch(() => setDbHealthy(false));
    refreshHistory();
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        activeDataset,
        setActiveDataset,
        activeExperiment,
        setActiveExperiment,
        activeModel,
        setActiveModel,
        historyList,
        refreshHistory,
        notification,
        showNotification,
        clearNotification,
        dbHealthy,
        loadSample,
        isLoadingSample,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
