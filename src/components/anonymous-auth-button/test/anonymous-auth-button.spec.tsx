import { newSpecPage } from '@stencil/core/testing';
import { AnonymousAuthButton } from '../anonymous-auth-button';

describe('anonymous-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AnonymousAuthButton],
      html: `<anonymous-auth-button></anonymous-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <anonymous-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </anonymous-auth-button>
    `);
  });
});
