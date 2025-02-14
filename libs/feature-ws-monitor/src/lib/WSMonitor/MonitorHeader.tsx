import { ChevronDown, ChevronUp } from 'lucide-react';

interface MonitorHeaderProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isConnected: boolean;
    activeTab?: 'live' | 'upcoming';
    totalChannels: number;
}

export const MonitorHeader = ({ isExpanded, setIsExpanded, isConnected, totalChannels }: MonitorHeaderProps) => {
    return (
        <div
            className="bg-white border-b flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm font-medium text-gray-700">Subscriptions ({totalChannels})</span>
            </div>
            {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
                <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
        </div>
    );
};
