import { newSpecPage } from '@stencil/core/testing';
import { TwitterAuthButton } from '../twitter-auth-button';

describe('twitter-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TwitterAuthButton],
      html: `<twitter-auth-button></twitter-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <twitter-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </twitter-auth-button>
    `);
  });
});
