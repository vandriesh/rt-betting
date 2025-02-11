import { test, expect } from '@playwright/test';

test('should create a bug report', async ({ request }) => {
    const issues = await request.get(`/api/events`);
    expect(issues.ok()).toBeTruthy();
    expect((await issues.json())?.[0].id).toEqual(1);
    expect((await issues.json())?.[0].name).toEqual('Manchester United vs Liverpool');
});
