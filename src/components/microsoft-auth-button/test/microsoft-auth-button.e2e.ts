import { newE2EPage } from '@stencil/core/testing';

describe('microsoft-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<microsoft-auth-button></microsoft-auth-button>');

    const element = await page.find('microsoft-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
