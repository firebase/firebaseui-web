import { newE2EPage } from '@stencil/core/testing';

describe('google-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<google-auth-button></google-auth-button>');

    const element = await page.find('google-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
