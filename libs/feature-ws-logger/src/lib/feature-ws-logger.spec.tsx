import { render } from '@testing-library/react';

import FeatureWsLogger from './feature-ws-logger';

describe('FeatureWsLogger', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<FeatureWsLogger />);
        expect(baseElement).toBeTruthy();
    });
});
