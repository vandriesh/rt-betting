import { render } from '@testing-library/react';

import LiveScore from './LiveScore';

describe('LiveScore', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<LiveScore />);
        expect(baseElement).toBeTruthy();
    });
});
