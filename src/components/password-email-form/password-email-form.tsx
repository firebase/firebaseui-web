import { Component, h, Element, Prop } from '@stencil/core';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from '@firebase/auth';
import { FirebaseSignInForm } from '../sign-in-form/sign-in-form';

// TODO change name to EmailPasswordForm?
@Component({
  tag: 'password-email-form',
  styleUrl: 'password-email-form.css',
  shadow: true,
})
export class PasswordEmailForm {
  @Element() el!: HTMLElement;
  form!: FirebaseSignInForm;
  methodId = Math.random();
  @Prop() state: any = undefined;
  componentWillLoad() {
    // TODO error if there isn't a form
    this.form = this.el.closest('firebase-sign-in-form') as any; // TODO sort out types
  }
  render() {
    const cancel = (e: MouseEvent) => {
      e.preventDefault();
      this.form.activeMethod = undefined;
      this.state = undefined;
    };
    const privacyPolicyLink = this.form.privacyPolicyUrl ? <a href={this.form.privacyPolicyUrl}>Privacy Policy</a> : undefined;
    const tosLink = this.form.tosUrl ? <a href={this.form.tosUrl}>Terms of Service</a> : undefined;
    // TODO show the form if it's the only child
    if (this.state) {
      switch(this.state.form) {
        case 'signup': {
          const onSubmit = async (e: any) => {
            e.preventDefault();
            this.form.setLoading(true);
            const email: string = e.submitter.form.email.value;
            const password = e.submitter.form.password.value;
            const result = await createUserWithEmailAndPassword(await this.form.auth, email, password).catch((e: Error) => e);
            this.form.setLoading(false);
            if (result instanceof Error) {
              // TODO add error handling in UI
              console.error(result);
            } else {
              this.form.activeMethod = undefined;
              this.state = undefined;
              this.form.signInSuccessfulHandler(result);
            }
          };
          return <form onSubmit={onSubmit}>
            <h2>Create account</h2>
            <label>Email <input name="email" type="email"></input></label>
            <label>Choose password <input name="password" type="password"></input></label>
            <input type="submit" value="Save"></input>
            <button onClick={cancel}>Cancel</button>
            {tosLink} {privacyPolicyLink}
          </form>;
        }
        case 'password': {
          const onSubmit = async (e: any) => {
            e.preventDefault();
            this.form.setLoading(true);
            const email: string = e.submitter.form.email.value;
            const password = e.submitter.form.password.value;
            const result = await signInWithEmailAndPassword(await this.form.auth, email, password).catch((e: Error) => e);
            this.form.setLoading(false);
            if (result instanceof Error) {
              // TODO add error handling to the UI
              console.error(result);
            } else {
              this.form.activeMethod = undefined;
              this.state = undefined;
              this.form.signInSuccessfulHandler(result);
            }
          };
          return <form onSubmit={onSubmit}>
            <h2>Sign in</h2>
            <label>Email <input name="email" type="email"></input></label>
            <label>Password <input name="password" type="password"></input></label>
            <input type="submit" value="Sign In"></input>
            <button onClick={cancel}>Cancel</button>
            <a href="#" onClick={() => alert('TODO')}>Trouble signing in?</a>
            {tosLink} {privacyPolicyLink}
          </form>;
        }
        case undefined: {
          const onSubmit = async (e: any) => {
            e.preventDefault();
            this.form.setLoading(true);
            const email: string = e.submitter.form.email.value;
            const result = await fetchSignInMethodsForEmail(await this.form.auth, email).catch((e: Error) => e);
            this.form.setLoading(false);
            if (result instanceof Error) {
              // TODO add error handling in UI
              console.error(result);
            } else if (result.length > 0) {
              this.state = {email, form: 'password'};
            } else {
              this.state = {email, form: 'signup'};
            }
          };
          return <form onSubmit={onSubmit}>
            <h2>Sign in with email</h2>
            <label>Email <input name="email" type="email"></input></label>
            <input type="submit" value="Next"></input>
            <button onClick={cancel}>Cancel</button>
            {tosLink} {privacyPolicyLink}
          </form>;
        }
      }
    }
    return <button class="login mail" onClick={() => { this.form.activeMethod = this; this.state = {}; }}>
      <img src={`${this.form.assetBasePath}/mail.svg`} />
      Sign in with email
    </button>;
  }

}