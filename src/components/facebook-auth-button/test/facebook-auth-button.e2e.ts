import { newE2EPage } from '@stencil/core/testing';

describe('facebook-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<facebook-auth-button></facebook-auth-button>');

    const element = await page.find('facebook-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
