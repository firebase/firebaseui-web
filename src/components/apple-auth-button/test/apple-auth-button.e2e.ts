import { newE2EPage } from '@stencil/core/testing';

describe('apple-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<apple-auth-button></apple-auth-button>');

    const element = await page.find('apple-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
