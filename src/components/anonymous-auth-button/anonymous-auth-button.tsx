import { Component, h, Element } from '@stencil/core';
import { signInAnonymously } from '@firebase/auth';
import { FirebaseError } from '@firebase/util';
import { FirebaseSignInForm } from '../sign-in-form/sign-in-form';

@Component({
  tag: 'anonymous-auth-button',
  styleUrl: 'anonymous-auth-button.css',
  shadow: true,
})
export class AnonymousAuthButton {
  @Element() el!: HTMLElement;
  form!: FirebaseSignInForm;
  onClick = async (e: MouseEvent) => {
    e.preventDefault();
    this.form.setLoading(true);
    const result = await signInAnonymously(await this.form.auth).catch((e: FirebaseError) => e);
    this.form.setLoading(false);
    if (result instanceof FirebaseError) {
      console.error(result);
    } else {
      this.form.signInSuccessfulHandler(result);
    }
  }
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
  fullLabel = 'Continue as guest';
  icon = 'anonymous.png';
  cssClasses = [];
}
