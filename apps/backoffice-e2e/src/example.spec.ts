import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const boPort = 4201;
const sbPort = 4200;

test.describe('Real-time synchronization between Back Office and Sportsbook', () => {
    let boContext: BrowserContext;
    let sbContext: BrowserContext;
    let boPage: Page;
    let sbPage: Page;

    test.beforeAll(async ({ browser }) => {
        // Create isolated contexts for each application
        boContext = await browser.newContext();
        sbContext = await browser.newContext();

        // Create pages in isolated contexts
        boPage = await boContext.newPage();
        sbPage = await sbContext.newPage();
    });

    test.beforeEach(async ({ request }) => {
        // Reset server state
        await request.post('http://localhost:3001/api/reset');

        // Load applications with cache disabled
        await Promise.all([boPage.goto(`http://localhost:${boPort}`), sbPage.goto(`http://localhost:${sbPort}`)]);
    });

    test.afterAll(async () => {
        // Close contexts and pages
        await Promise.all([boContext.close(), sbContext.close()]);
    });

    test('should sync price updates from Back Office to Sportsbook', async () => {
        // Get the first event in both applications
        const boEvent = boPage.getByTestId('event-item').first();
        const sbEvent = sbPage.getByTestId('event-item').first();

        // Get initial price from both sides
        const boInitialPrice = await boEvent.getByTestId('selection-price').first().textContent();
        const sbInitialPrice = await sbEvent.getByTestId('selection-price').first().textContent();

        // Verify initial prices match
        expect(boInitialPrice).toBe(sbInitialPrice);
        expect(sbInitialPrice).toBe('2.50');

        // Update price in Back Office
        await boEvent.getByTestId('price-increase').first().click();

        // Wait for price update animation in Sportsbook
        await sbEvent
            .getByTestId('selection-price')
            .first()
            .locator('visible=true')
            .and(sbEvent.locator('.animate-price-up'))
            .waitFor();

        // Get updated prices
        const boUpdatedPrice = await boEvent.getByTestId('selection-price').first().textContent();
        const sbUpdatedPrice = await sbEvent.getByTestId('selection-price').first().textContent();

        // Verify prices are synced
        expect(boUpdatedPrice).toBe(sbUpdatedPrice);
        expect(parseFloat(boUpdatedPrice!)).toBeGreaterThan(parseFloat(boInitialPrice!));
        expect(boUpdatedPrice).toBe('2.60');
    });

    test('should sync suspension state from Back Office to Sportsbook', async () => {
        // Get the first event in both applications
        const boEvent = boPage.getByTestId('event-item').first();
        const sbEvent = sbPage.getByTestId('event-item').first();

        // Suspend event in Back Office
        await boEvent.getByTestId('suspend-toggle').click();

        // Wait for suspension state in Sportsbook
        await sbEvent.getByTestId('suspended-indicator').waitFor();

        // Verify event is suspended in both applications
        await expect(boEvent.getByTestId('suspended-indicator')).toBeVisible();
        await expect(sbEvent.getByTestId('suspended-indicator')).toBeVisible();

        // Verify betting is disabled in Sportsbook
        await expect(sbEvent.getByTestId('selection-button').first()).toBeDisabled();
    });

    test('should handle bet placement in Sportsbook', async () => {
        // Get the first non-suspended event
        const sbEvent = sbPage
            .getByTestId('event-item')
            //.filter({ has: sbPage.getByTestId('suspended-indicator').not() })
            .first();

        // Click on a selection to add to betslip
        await sbEvent.getByTestId('selection-button').first().click();

        // Verify selection is added to betslip
        const betslipItem = sbPage.getByTestId('betslip-item').first();
        await expect(betslipItem).toBeVisible();

        // Enter stake
        await betslipItem.getByTestId('stake-input').fill('10');

        // Verify potential winnings are calculated
        const stake = 10;
        const price = parseFloat((await betslipItem.getByTestId('selection-price').textContent()) || '0');
        const expectedWinnings = stake * price;

        let actualWinningsTextContent = await sbPage.getByTestId('potential-winnings').textContent();
        const actualWinnings = parseFloat(actualWinningsTextContent?.replace('$', '') || '0');

        expect(actualWinningsTextContent).toBe(`$25.00`);
        expect(actualWinningsTextContent).toBe(`$${expectedWinnings}.00`);
        expect(actualWinnings).toBeCloseTo(expectedWinnings);
    });

    test('should sync price changes while bet is in betslip', async () => {
        // Get the first non-suspended event in both applications
        const boEvent = boPage
            .getByTestId('event-item')
            //.filter({ has: boPage.getByTestId('suspended-indicator').not() })
            .first();
        const betslipItem = sbPage.getByTestId('betslip-item').first();

        // Get initial price in betslip
        const initialPrice = await betslipItem.getByTestId('selection-price').textContent();

        // Update price in Back Office
        await boEvent.getByTestId('price-increase').first().click();

        // Wait for price update animation in betslip
        await betslipItem
            .getByTestId('selection-price')
            .locator('visible=true')
            .and(betslipItem.locator('.animate-price-up'))
            .waitFor();

        // Get updated price in betslip
        const updatedPrice = await betslipItem.getByTestId('selection-price').textContent();

        // Verify price was updated
        expect(parseFloat(updatedPrice!)).toBeGreaterThan(parseFloat(initialPrice!));

        // Verify potential winnings were recalculated
        const stake = 10;
        const expectedWinnings = stake * parseFloat(updatedPrice!);
        let actualWinningsTextContent = await sbPage.getByTestId('potential-winnings').textContent();
        const actualWinnings = parseFloat(actualWinningsTextContent?.replace('$', '') || '0');
        expect(actualWinnings).toBeCloseTo(expectedWinnings, 2);

        expect(actualWinningsTextContent).toBe(`$26.00`);
        expect(actualWinningsTextContent).toBe(`$${expectedWinnings}.00`);
        expect(actualWinnings).toBeCloseTo(expectedWinnings);
    });
});
