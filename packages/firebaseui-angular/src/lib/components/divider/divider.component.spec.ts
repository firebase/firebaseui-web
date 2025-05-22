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

import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DividerComponent } from './divider.component';

// Create a test host component with projected text content
@Component({
  template: `<fui-divider class="custom-class" data-testid="divider-with-text"
    >OR</fui-divider
  >`,
  standalone: true,
  imports: [DividerComponent],
})
class TestHostWithTextComponent {}

// Create a test host component with input text content
@Component({
  template: `<fui-divider
    class="custom-class"
    data-testid="divider-with-input-text"
    [text]="'OR'"
  ></fui-divider>`,
  standalone: true,
  imports: [DividerComponent],
})
class TestHostWithInputTextComponent {}

// Create a test host component without text content
@Component({
  template: `<fui-divider
    data-testid="divider-no-text"
    aria-label="divider"
  ></fui-divider>`,
  standalone: true,
  imports: [DividerComponent],
})
class TestHostNoTextComponent {}

describe('DividerComponent', () => {
  let textFixture: ComponentFixture<TestHostWithTextComponent>;
  let inputTextFixture: ComponentFixture<TestHostWithInputTextComponent>;
  let noTextFixture: ComponentFixture<TestHostNoTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DividerComponent,
        TestHostWithTextComponent,
        TestHostWithInputTextComponent,
        TestHostNoTextComponent,
      ],
    }).compileComponents();

    textFixture = TestBed.createComponent(TestHostWithTextComponent);
    inputTextFixture = TestBed.createComponent(TestHostWithInputTextComponent);
    noTextFixture = TestBed.createComponent(TestHostNoTextComponent);
  });

  it('renders a divider with no text', () => {
    noTextFixture.detectChanges();

    const dividerHost = noTextFixture.debugElement.query(
      By.css('[data-testid="divider-no-text"]')
    );
    const dividerEl = dividerHost.query(By.css('.fui-divider'));

    expect(dividerEl).toBeTruthy();
    expect(
      dividerEl.nativeElement.classList.contains('fui-divider')
    ).toBeTrue();

    // Check for a single divider line when no text
    const dividerLines = dividerEl.queryAll(By.css('.fui-divider__line'));
    expect(dividerLines.length).toBe(1);

    // Check that text container does not exist
    const textEl = dividerEl.query(By.css('.fui-divider__text'));
    expect(textEl).toBeFalsy();

    // Check aria-label on the host element
    expect(dividerHost.nativeElement.getAttribute('aria-label')).toBe(
      'divider'
    );
  });

  it('renders a divider with input text attribute', fakeAsync(() => {
    inputTextFixture.detectChanges();
    tick(0);
    inputTextFixture.detectChanges();

    const dividerHost = inputTextFixture.debugElement.query(
      By.css('[data-testid="divider-with-input-text"]')
    );

    // Get the component instance
    const dividerComponent = dividerHost.componentInstance;
    expect(dividerComponent.text).toBe('OR');

    const dividerEl = dividerHost.query(By.css('.fui-divider'));
    expect(dividerEl).toBeTruthy();

    // Check for two divider lines when there is text
    const dividerLines = dividerEl.queryAll(By.css('.fui-divider__line'));
    expect(dividerLines.length).toBe(2);

    // Check that text container exists
    const textEl = dividerEl.query(By.css('.fui-divider__text'));
    expect(textEl).toBeTruthy();
  }));

  it('applies custom className', () => {
    inputTextFixture.detectChanges();

    const dividerHost = inputTextFixture.debugElement.query(
      By.css('[data-testid="divider-with-input-text"]')
    );

    // Class should be on the host element
    expect(
      dividerHost.nativeElement.classList.contains('custom-class')
    ).toBeTrue();
  });
});
