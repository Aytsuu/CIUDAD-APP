import { useTBHistory } from '../family-profling/queries/profilingHistoryQueries';
import { HistoryList } from '@/components/health-profiling/HistoryList';

interface TBHistoryDisplayProps {
  tbId: string;
}

export const TBHistoryDisplay = ({ tbId }: TBHistoryDisplayProps) => {
  const { data: history, isLoading } = useTBHistory(tbId);

  return (
    <HistoryList
      history={history || []}
      entityType="tb"
      entityTitle="TB Surveillance Record"
      isLoading={isLoading}
    />
  );
};
