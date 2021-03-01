import { newE2EPage } from '@stencil/core/testing';

describe('twitter-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<twitter-auth-button></twitter-auth-button>');

    const element = await page.find('twitter-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
