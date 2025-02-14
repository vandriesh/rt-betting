import { render } from '@testing-library/react';

import FeatureBetslip from './feature-betslip';

describe('FeatureBetslip', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<FeatureBetslip />);
        expect(baseElement).toBeTruthy();
    });
});
