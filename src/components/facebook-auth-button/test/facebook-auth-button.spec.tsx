import { newSpecPage } from '@stencil/core/testing';
import { FacebookAuthButton } from '../facebook-auth-button';

describe('facebook-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [FacebookAuthButton],
      html: `<facebook-auth-button></facebook-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <facebook-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </facebook-auth-button>
    `);
  });
});
