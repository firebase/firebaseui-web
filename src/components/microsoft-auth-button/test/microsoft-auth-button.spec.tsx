import { newSpecPage } from '@stencil/core/testing';
import { MicrosoftAuthButton } from '../microsoft-auth-button';

describe('microsoft-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MicrosoftAuthButton],
      html: `<microsoft-auth-button></microsoft-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <microsoft-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </microsoft-auth-button>
    `);
  });
});
