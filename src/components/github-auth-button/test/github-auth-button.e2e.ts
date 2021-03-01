import { newE2EPage } from '@stencil/core/testing';

describe('github-auth-button', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<github-auth-button></github-auth-button>');

    const element = await page.find('github-auth-button');
    expect(element).toHaveClass('hydrated');
  });
});
