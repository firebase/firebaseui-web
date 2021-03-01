import { newSpecPage } from '@stencil/core/testing';
import { GithubAuthButton } from '../github-auth-button';

describe('github-auth-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [GithubAuthButton],
      html: `<github-auth-button></github-auth-button>`,
    });
    expect(page.root).toEqualHtml(`
      <github-auth-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </github-auth-button>
    `);
  });
});
