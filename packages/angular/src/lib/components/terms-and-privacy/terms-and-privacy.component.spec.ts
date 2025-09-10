/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { FirebaseUI, FirebaseUIPolicies } from '../../provider';
import { TermsAndPrivacyComponent } from './terms-and-privacy.component';

class MockFirebaseUI {
  private _termsText = new BehaviorSubject<string>('Terms of Service');
  private _privacyText = new BehaviorSubject<string>('Privacy Policy');
  private _templateText = new BehaviorSubject<string>(
    'By continuing, you agree to our {tos} and {privacy}',
  );

  translation(section: string, key: string) {
    if (section === 'labels' && key === 'termsOfService') {
      return this._termsText.asObservable();
    }
    if (section === 'labels' && key === 'privacyPolicy') {
      return this._privacyText.asObservable();
    }
    if (section === 'messages' && key === 'termsAndPrivacy') {
      return this._templateText.asObservable();
    }
    return new BehaviorSubject<string>(`${section}.${key}`).asObservable();
  }

  setTranslation(section: string, key: string, value: string) {
    if (section === 'labels' && key === 'termsOfService') {
      this._termsText.next(value);
    } else if (section === 'labels' && key === 'privacyPolicy') {
      this._privacyText.next(value);
    } else if (section === 'messages' && key === 'termsAndPrivacy') {
      this._templateText.next(value);
    }
  }
}

function configureComponentTest({
  tosUrl,
  privacyPolicyUrl,
}: {
  tosUrl?: string | null;
  privacyPolicyUrl?: string | null;
}) {
  const mockFirebaseUI = new MockFirebaseUI();

  TestBed.configureTestingModule({
    imports: [TermsAndPrivacyComponent],
    providers: [
      { provide: FirebaseUI, useValue: mockFirebaseUI },
      {
        provide: FirebaseUIPolicies,
        useValue: {
          termsOfServiceUrl: tosUrl,
          privacyPolicyUrl: privacyPolicyUrl,
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TermsAndPrivacyComponent);
  const component = fixture.componentInstance;

  return { fixture, component, mockFirebaseUI };
}

describe('TermsAndPrivacyComponent', () => {
  it('renders component with terms and privacy links', fakeAsync(() => {
    const { fixture } = configureComponentTest({
      tosUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
    });

    tick();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.text-text-muted'));
    expect(container).toBeTruthy();

    const textContent = container.nativeElement.textContent;
    expect(textContent).toContain('By continuing, you agree to our');

    const tosLink = fixture.debugElement
      .queryAll(By.css('a'))
      .find((el) => el.nativeElement.textContent.includes('Terms of Service'));
    expect(tosLink).toBeTruthy();
    expect(tosLink!.nativeElement.getAttribute('target')).toBe('_blank');
    expect(tosLink!.nativeElement.getAttribute('rel')).toBe(
      'noopener noreferrer',
    );

    const privacyLink = fixture.debugElement.query(
      By.css('a[href="https://example.com/privacy"]'),
    );
    expect(privacyLink).toBeTruthy();
    expect(privacyLink.nativeElement.textContent.trim()).toBe('Privacy Policy');
  }));

  it('does not render when both tosUrl and privacyPolicyUrl are not provided', fakeAsync(() => {
    const { fixture } = configureComponentTest({
      tosUrl: null,
      privacyPolicyUrl: null,
    });

    tick();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.text-text-muted'));
    expect(container).toBeFalsy();
  }));

  it('renders with tosUrl when privacyPolicyUrl is not provided', fakeAsync(() => {
    const { fixture } = configureComponentTest({
      tosUrl: 'https://example.com/terms',
      privacyPolicyUrl: null,
    });

    tick();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.text-text-muted'));
    expect(container).toBeTruthy();

    const tosLink = fixture.debugElement.query(
      By.css('a[href="https://example.com/terms"]'),
    );
    expect(tosLink).toBeTruthy();

    const privacyLink = fixture.debugElement.query(
      By.css('a[href="https://example.com/privacy"]'),
    );
    expect(privacyLink).toBeFalsy();
  }));

  it('renders with privacyPolicyUrl when tosUrl is not provided', fakeAsync(() => {
    const { fixture } = configureComponentTest({
      tosUrl: null,
      privacyPolicyUrl: 'https://example.com/privacy',
    });

    tick();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.text-text-muted'));
    expect(container).toBeTruthy();

    const tosLink = fixture.debugElement.query(
      By.css('a[href="https://example.com/terms"]'),
    );
    expect(tosLink).toBeFalsy();

    const privacyLink = fixture.debugElement.query(
      By.css('a[href="https://example.com/privacy"]'),
    );
    expect(privacyLink).toBeTruthy();
  }));

  it('uses custom template text when provided', fakeAsync(() => {
    const { fixture, mockFirebaseUI } = configureComponentTest({
      tosUrl: 'https://example.com/terms',
      privacyPolicyUrl: 'https://example.com/privacy',
    });

    mockFirebaseUI.setTranslation(
      'messages',
      'termsAndPrivacy',
      'Custom template with {tos} and {privacy}',
    );

    tick();
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.text-text-muted'));
    expect(container).toBeTruthy();

    const textContent = container.nativeElement.textContent;
    expect(textContent).toContain('Custom template with');
    expect(textContent).toContain('Terms of Service');
    expect(textContent).toContain('Privacy Policy');
  }));
});
