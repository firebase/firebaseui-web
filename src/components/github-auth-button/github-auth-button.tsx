import { Component, Element, h } from '@stencil/core';
import { signInWithRedirect, GithubAuthProvider, browserPopupRedirectResolver } from '@firebase/auth';
import { REDIRECT_INITIATED_AT_KEY } from '../../utils/utils';
import { FirebaseSignInForm } from '../sign-in-form/sign-in-form';

@Component({
  tag: 'github-auth-button',
  styleUrl: 'github-auth-button.css',
  shadow: true,
})
export class GithubAuthButton {
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
    this.form.auth.then(auth => signInWithRedirect(auth, new GithubAuthProvider(), browserPopupRedirectResolver));
  }
  fullLabel = 'Sign in with GitHub';
  icon = 'github.svg';
  cssClasses = ['login', 'github-com'];
}
