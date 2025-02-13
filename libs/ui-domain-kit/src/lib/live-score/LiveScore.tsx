import { Clock } from 'lucide-react';

import { type Event } from '@my-org/common';
import { S_h5 } from '@my-org/ui-kit';

interface OwnProps {
    event: Event;
}
function LiveScore({ event }: OwnProps) {
    return (
        <>
            <span className="inline-flex items-center text-red-500 text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {event.timeElapsed}'
            </span>
            <S_h5>
                {event.score?.home} - {event.score?.away}
            </S_h5>
        </>
    );
}

export default LiveScore;
