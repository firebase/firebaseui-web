import { Component } from '@stencil/core';
import { signInWithRedirect, OAuthProvider, browserPopupRedirectResolver } from '@firebase/auth';
import { REDIRECT_INITIATED_AT_KEY } from '../../utils/utils';
import { FirebaseSignInForm } from '../sign-in-form/sign-in-form';
import { h, Element } from '@stencil/core';

@Component({
  tag: 'apple-auth-button',
  styleUrl: 'apple-auth-button.css',
  shadow: true,
})
export class AppleAuthButton {
  @Element() el!: HTMLElement;
  form!: FirebaseSignInForm;
  componentWillLoad() {
    // TODO error if there isn't a form
    this.form = this.el.closest('firebase-sign-in-form') as any; // TODO sort out types
  }
  render() {
    return <button class={this.cssClasses.join(' ')} onClick={(e) => this.onClick(e)}>
      <slot>
        <img src={`${this.form.assetBasePath}/${this.icon}`} />
        {this.fullLabel}
      </slot>
    </button>
  };
  onClick = (e: MouseEvent) => {
    e.preventDefault();
    this.form.setLoading(true);
    sessionStorage.setItem(REDIRECT_INITIATED_AT_KEY, new Date().toJSON());
    this.form.auth.then(auth => signInWithRedirect(auth, new OAuthProvider('apple.com'), browserPopupRedirectResolver));
  }
  fullLabel = 'Sign in with Apple';
  icon = 'apple.png';
  cssClasses = ['login', 'apple-com'];
}
