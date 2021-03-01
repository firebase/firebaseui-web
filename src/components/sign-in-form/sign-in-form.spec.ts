import { newSpecPage } from '@stencil/core/testing';
import { FirebaseSignInForm } from './sign-in-form';
import { initializeApp } from '@firebase/app';

describe('firebase-sign-in-form', () => {

  beforeAll(() => {
    initializeApp({
      apiKey: "AIzaSyAuTP4cG5noVZJmPJhBT_Uu5_DETT5uFbo",
      authDomain: "fir-ui-test-7cd1d.firebaseapp.com",
      projectId: "fir-ui-test-7cd1d",
      storageBucket: "fir-ui-test-7cd1d.appspot.com",
      messagingSenderId: "226010084826",
      appId: "1:226010084826:web:19f3ac2f1afa5920e23ce3"
    });
  })

  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [FirebaseSignInForm],
      html: '<firebase-sign-in-form></firebase-sign-in-form>',
    });
    expect(root).toEqualHtml(`
      <firebase-sign-in-form-form>
        <mock:shadow-root>
          <div>
            Hello, World! I'm
          </div>
        </mock:shadow-root>
      </firebase-sign-in-form>
    `);
  });

  it('renders with values', async () => {
    const { root } = await newSpecPage({
      components: [FirebaseSignInForm],
      html: `<firebase-sign-in-form
        sign-in-options="['google.com']"
        tos-url="http://yada"
        privacy-policy-url="http://yada"
      ></firebase-sign-in-form>`,
    });
    expect(root).toEqualHtml(`
      <firebase-sign-in-form first="Stencil" last="'Don't call me a framework' JS">
        <mock:shadow-root>
          <div>
            Hello, World! I'm Stencil 'Don't call me a framework' JS
          </div>
        </mock:shadow-root>
      </firebase-sign-in-form>
    `);
  });
});
