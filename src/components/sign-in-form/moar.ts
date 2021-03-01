import { UserCredential } from '@firebase/auth-types';

export const enum Events {
    SignInSuccess = 'signInSuccessful'
};

// TODO clean up
declare global {
    interface HTMLElementEventMap {
        [Events.SignInSuccess]: CustomEvent<UserCredential>;
    }
}