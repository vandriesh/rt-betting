import { render } from '@testing-library/react';

import FeatureEventList from './feature-event-list';

describe('FeatureEventList', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<FeatureEventList />);
        expect(baseElement).toBeTruthy();
    });
});
