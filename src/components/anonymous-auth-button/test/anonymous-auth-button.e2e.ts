import { newE2EPage } from '@stencil/core/testing';

describe('anonymous-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<anonymous-auth-button></anonymous-auth-button>');

    const element = await page.find('anonymous-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
