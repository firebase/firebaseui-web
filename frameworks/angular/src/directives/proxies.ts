/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, NgZone } from '@angular/core';
import { ProxyCmp, proxyOutputs } from './angular-component-lib/utils';

import { Components } from 'firebaseui';


export declare interface AnonymousAuthButton extends Components.AnonymousAuthButton {}

@Component({
  selector: 'anonymous-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AnonymousAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface AppleAuthButton extends Components.AppleAuthButton {}

@Component({
  selector: 'apple-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class AppleAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface FacebookAuthButton extends Components.FacebookAuthButton {}

@Component({
  selector: 'facebook-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class FacebookAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}

import { FirebaseSignInForm as IFirebaseSignInForm } from 'firebaseui/dist/custom-elements/components/sign-in-form/sign-in-form';
export declare interface FirebaseSignInForm extends Components.FirebaseSignInForm {}
@ProxyCmp({
  inputs: ['assetBasePath', 'autoUpgradeAnonymousUsers', 'privacyPolicyUrl', 'signInSuccessUrl', 'tosUrl'],
  methods: ['setAuth']
})
@Component({
  selector: 'firebase-sign-in-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['assetBasePath', 'autoUpgradeAnonymousUsers', 'privacyPolicyUrl', 'signInSuccessUrl', 'tosUrl'],
  outputs: ['signInSuccessful']
})
export class FirebaseSignInForm {
  /**  */
  signInSuccessful!: IFirebaseSignInForm['signInSuccessful'];
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
    proxyOutputs(this, this.el, ['signInSuccessful']);
  }
}


export declare interface GithubAuthButton extends Components.GithubAuthButton {}

@Component({
  selector: 'github-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class GithubAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface GoogleAuthButton extends Components.GoogleAuthButton {}

@Component({
  selector: 'google-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class GoogleAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface MicrosoftAuthButton extends Components.MicrosoftAuthButton {}

@Component({
  selector: 'microsoft-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class MicrosoftAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface PasswordEmailForm extends Components.PasswordEmailForm {}
@ProxyCmp({
  inputs: ['state']
})
@Component({
  selector: 'password-email-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  inputs: ['state']
})
export class PasswordEmailForm {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface TwitterAuthButton extends Components.TwitterAuthButton {}

@Component({
  selector: 'twitter-auth-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>'
})
export class TwitterAuthButton {
  protected el: HTMLElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}
