import { newSpecPage } from '@stencil/core/testing';
import { PasswordEmailForm } from '../password-email-form';

describe('password-email-form', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PasswordEmailForm],
      html: `<password-email-form></password-email-form>`,
    });
    expect(page.root).toEqualHtml(`
      <password-email-form>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </password-email-form>
    `);
  });
});
