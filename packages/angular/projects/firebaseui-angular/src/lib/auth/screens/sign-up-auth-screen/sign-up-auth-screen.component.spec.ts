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

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FirebaseUI } from '../../../provider';
import { SignUpAuthScreenComponent } from './sign-up-auth-screen.component';

// Mock Card components
@Component({
  selector: 'fui-card',
  template: '<div class="fui-card"><ng-content></ng-content></div>',
  standalone: true,
})
class MockCardComponent {}

@Component({
  selector: 'fui-card-header',
  template: '<div class="fui-card-header"><ng-content></ng-content></div>',
  standalone: true,
})
class MockCardHeaderComponent {}

@Component({
  selector: 'fui-card-title',
  template: '<h2 class="fui-card-title"><ng-content></ng-content></h2>',
  standalone: true,
})
class MockCardTitleComponent {}

@Component({
  selector: 'fui-card-subtitle',
  template: '<p class="fui-card-subtitle"><ng-content></ng-content></p>',
  standalone: true,
})
class MockCardSubtitleComponent {}

// Mock RegisterForm component
@Component({
  selector: 'fui-register-form',
  template: `
    <div data-testid="register-form">
      Register Form
      <p>Sign In Route: {{ signInRoute }}</p>
    </div>
  `,
  standalone: true,
})
class MockRegisterFormComponent {
  @Input() signInRoute: string = '';
}

// Mock Divider component
@Component({
  selector: 'fui-divider',
  template: '<div class="fui-divider"><ng-content></ng-content></div>',
  standalone: true,
})
class MockDividerComponent {}

// Create mock for FirebaseUi provider
class MockFirebaseUi {
  translation(category: string, key: string) {
    if (category === 'labels' && key === 'register') {
      return of('Create Account');
    }
    if (category === 'prompts' && key === 'enterDetailsToCreate') {
      return of('Enter your details to create an account');
    }
    if (category === 'messages' && key === 'dividerOr') {
      return of('OR');
    }
    return of(`${category}.${key}`);
  }
}

// Test component with content projection
@Component({
  template: `
    <fui-sign-up-auth-screen>
      <div data-testid="test-child">Child element</div>
    </fui-sign-up-auth-screen>
  `,
  standalone: true,
  imports: [SignUpAuthScreenComponent],
})
class TestHostWithChildrenComponent {}

// Test component without content projection
@Component({
  template: ` <fui-sign-up-auth-screen></fui-sign-up-auth-screen> `,
  standalone: true,
  imports: [SignUpAuthScreenComponent],
})
class TestHostWithoutChildrenComponent {}

describe('SignUpAuthScreenComponent', () => {
  let mockFirebaseUi: MockFirebaseUi;

  beforeEach(async () => {
    mockFirebaseUi = new MockFirebaseUi();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SignUpAuthScreenComponent,
        TestHostWithChildrenComponent,
        TestHostWithoutChildrenComponent,
        MockCardComponent,
        MockCardHeaderComponent,
        MockCardTitleComponent,
        MockCardSubtitleComponent,
        MockRegisterFormComponent,
        MockDividerComponent,
      ],
      providers: [{ provide: FirebaseUI, useValue: mockFirebaseUi }],
    }).compileComponents();

    TestBed.overrideComponent(SignUpAuthScreenComponent, {
      set: {
        imports: [
          CommonModule,
          MockCardComponent,
          MockCardHeaderComponent,
          MockCardTitleComponent,
          MockCardSubtitleComponent,
          MockRegisterFormComponent,
          MockDividerComponent,
        ],
      },
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SignUpAuthScreenComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('renders the correct title and subtitle', () => {
    const fixture = TestBed.createComponent(SignUpAuthScreenComponent);
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('.fui-card-title'));
    const subtitleEl = fixture.debugElement.query(By.css('.fui-card-subtitle'));

    expect(titleEl.nativeElement.textContent).toBe('Create Account');
    expect(subtitleEl.nativeElement.textContent).toBe(
      'Enter your details to create an account'
    );
  });

  it('includes the RegisterForm component', () => {
    const fixture = TestBed.createComponent(SignUpAuthScreenComponent);
    fixture.detectChanges();

    const formEl = fixture.debugElement.query(
      By.css('[data-testid="register-form"]')
    );
    expect(formEl).toBeTruthy();
    expect(formEl.nativeElement.textContent).toContain('Register Form');
  });

  it('passes signInRoute to RegisterForm', () => {
    const fixture = TestBed.createComponent(SignUpAuthScreenComponent);
    const component = fixture.componentInstance;

    component.signInRoute = '/sign-in';

    fixture.detectChanges();

    const formEl = fixture.debugElement.query(
      By.css('[data-testid="register-form"]')
    );
    expect(formEl.nativeElement.textContent).toContain(
      'Sign In Route: /sign-in'
    );
  });

  it('renders children when provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithChildrenComponent);
    fixture.detectChanges();

    // Wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const childEl = fixture.debugElement.query(
      By.css('[data-testid="test-child"]')
    );
    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));

    expect(childEl).toBeTruthy();
    expect(childEl.nativeElement.textContent).toBe('Child element');
    expect(dividerEl).toBeTruthy();
    expect(dividerEl.nativeElement.textContent).toBe('OR');
  }));

  it('does not render divider or children container when no children are provided', fakeAsync(() => {
    const fixture = TestBed.createComponent(TestHostWithoutChildrenComponent);
    fixture.detectChanges();

    // Wait for the setTimeout in ngAfterContentInit
    tick(0);
    fixture.detectChanges();

    const dividerEl = fixture.debugElement.query(By.css('.fui-divider'));
    expect(dividerEl).toBeFalsy();
  }));
});
