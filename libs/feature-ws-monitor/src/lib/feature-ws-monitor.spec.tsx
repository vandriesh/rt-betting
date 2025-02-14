import { render } from '@testing-library/react';

import FeatureWsMonitor from './feature-ws-monitor';

describe('FeatureWsMonitor', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<FeatureWsMonitor />);
        expect(baseElement).toBeTruthy();
    });
});
