import { newSpecPage } from '@stencil/core/testing';
import { GoogleAuthButton } from '../google-auth-button';

describe('google-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GoogleAuthButton],
      html: `<google-auth-button></google-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <google-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </google-auth-button>
    `);
  });
});
