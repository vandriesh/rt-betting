import { render } from '@testing-library/react';
import "@testing-library/jest-dom";

import LiveScore from './LiveScore';

describe('LiveScore', () => {
    it('should render successfully', () => {
        const mockEvent = {
            id: 1,
            timeElapsed: 67
        }
        const { baseElement } = render(<LiveScore event={mockEvent}/>);
        expect(baseElement).toHaveTextContent("67'");
    });
});
