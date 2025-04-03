import { useState } from 'react';

interface UseDataLoadingProps {
  onLoad: () => Promise<void>;
  onError?: (error: Error) => void;
}

export const useDataLoading = ({ onLoad, onError }: UseDataLoadingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onLoad();
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
      onError?.(error instanceof Error ? error : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    return loadData();
  };

  return {
    isLoading,
    error,
    loadData,
    refreshData,
  };
}; 