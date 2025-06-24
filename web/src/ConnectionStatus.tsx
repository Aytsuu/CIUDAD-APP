import { useConnectionStatus } from './hooks/use-connection-status';

const statusColors = {
  connecting: 'bg-yellow-500',
  connected: 'bg-green-500',
  disconnected: 'bg-red-500',
  error: 'bg-red-500',
};

export const ConnectionStatus = () => {
  const connectionStatus = useConnectionStatus();
  
  return (
    <div className="fixed bottom-4 right-4 flex items-center">
      <span className={`w-3 h-3 rounded-full ${statusColors[connectionStatus]}`}></span>
      <span className="ml-2 text-sm capitalize">{connectionStatus}</span>
    </div>
  );
};