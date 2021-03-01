import { newSpecPage } from '@stencil/core/testing';
import { AppleAuthButton } from '../apple-auth-button';

describe('apple-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AppleAuthButton],
      html: `<apple-auth-button></apple-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <apple-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </apple-auth-button>
    `);
  });
});
