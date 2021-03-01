import { newE2EPage } from '@stencil/core/testing';

describe('password-email-form', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<password-email-form></password-email-form>');

    const element = await page.find('password-email-form');
    expect(element).toHaveClass('hydrated');
  });
});
