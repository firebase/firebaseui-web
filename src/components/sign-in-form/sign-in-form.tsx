import { Component, Prop, Host, h, State, Event, EventEmitter, Element, Method } from '@stencil/core';
import { Auth as FirebaseAuth, UserCredential } from '@firebase/auth-types';
import { getRedirectResult, browserPopupRedirectResolver } from '@firebase/auth';
import { REDIRECT_INITIATED_AT_KEY } from '../../utils/utils';
import { Events } from './moar';

@Component({
  tag: 'firebase-sign-in-form',
  styleUrl: 'sign-in-form.css',
  assetsDirs: ['assets'],
  shadow: true,
})
export class FirebaseSignInForm {

  /**
   * Whether to automatically upgrade existing anonymous users on sign-in/sign-up. See Upgrading anonymous users.
   */
  @Prop() autoUpgradeAnonymousUsers: boolean = false;

  /**
   * The URL of the Terms of Service page.
   */
  @Prop() tosUrl: string | undefined;

  loading=true;
  @Element() el!: HTMLElement;

  /**
   * The URL of the Privacy Policy page.
   */
  @Prop() privacyPolicyUrl: string | undefined;

  resolveAuth!: (auth: FirebaseAuth) => void;
  auth: Promise<FirebaseAuth>;

  @Prop() signInSuccessUrl: string | undefined;

  // TODO(jamesdaniels) why do I need this, why can't I get Stencil's built in stuff to work?
  @Prop() assetBasePath = 'assets';

  @State() activeMethod: any = undefined;

  constructor() {
    this.auth = new Promise(resolve => {
      this.resolveAuth = resolve;
    });
  }

  setLoading(loading: boolean) {
    this.loading = loading;
    if (loading) {
      this.el.setAttribute('loading', '');
    } else {
      this.el.removeAttribute('loading');
    }
  }

  @Method()
  async setAuth(auth: FirebaseAuth) {
    this.resolveAuth(auth);
  }

  @Event({
    eventName: Events.SignInSuccess,
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  signInSuccessful!: EventEmitter<UserCredential>; // TODO what's with the type here?

  signInSuccessfulHandler(credential: UserCredential) {
    const event = this.signInSuccessful.emit(credential);
    if (!event.defaultPrevented && this.signInSuccessUrl) {
      window.location.href = this.signInSuccessUrl;
    }
  }

  getActiveMethod() {
    return this.activeMethod;
  }

  componentWillLoad() {
    const redirectInitiatedAt = sessionStorage.getItem(REDIRECT_INITIATED_AT_KEY);
    if (redirectInitiatedAt) {
        // TODO should I check if this was recent?
        sessionStorage.removeItem(REDIRECT_INITIATED_AT_KEY);
        this.auth.then(auth => getRedirectResult(auth, browserPopupRedirectResolver)).then(credential => {
          this.setLoading(false);
          if (credential) {
            this.signInSuccessfulHandler(credential);
          }
        }).catch(e => {
          console.error(e);
          this.setLoading(false);
        });
    } else {
      this.auth.then(() => this.setLoading(false));
    }
  }

  render() {
    const privacyPolicyLink = this.privacyPolicyUrl ? <a href={this.privacyPolicyUrl}>Privacy Policy</a> : undefined;
    const tosLink = this.tosUrl ? <a href={this.tosUrl}>Terms of Service</a> : undefined;
    const terms = this.activeMethod === undefined && (privacyPolicyLink || tosLink) ? 
      <small>By continuing, you are indicating that you accept our {privacyPolicyLink}{privacyPolicyLink && tosLink ? ' and ' : undefined}{tosLink}.</small> :
      undefined;

    return <Host loading={this.loading}>
      <div class="loading-bar"></div>
      <slot />
      {terms}
    </Host>;
  }
}
