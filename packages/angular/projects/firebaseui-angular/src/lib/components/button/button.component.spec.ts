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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

@Component({
  template: `
    <fui-button (click)="handleClick()" data-testid="test-button"
      >Click me</fui-button
    >
    <fui-button variant="secondary" data-testid="secondary-button"
      >Secondary</fui-button
    >
    <fui-button class="custom-class" data-testid="custom-class-button"
      >Custom Class</fui-button
    >
    <fui-button [disabled]="true" data-testid="disabled-button"
      >Disabled</fui-button
    >
  `,
  standalone: true,
  imports: [ButtonComponent],
})
class TestHostComponent {
  clicks = 0;

  handleClick() {
    this.clicks++;
  }
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders with default variant (primary)', () => {
    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="test-button"]')
    );
    const button = buttonEl.nativeElement.querySelector('button');

    expect(button).toBeTruthy();
    expect(button.classList.contains('fui-button')).toBeTrue();
    expect(button.classList.contains('fui-button--secondary')).toBeFalse();
    expect(button.textContent.trim()).toBe('Click me');
  });

  it('renders with secondary variant', () => {
    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="secondary-button"]')
    );
    const button = buttonEl.nativeElement.querySelector('button');

    expect(button).toBeTruthy();
    expect(button.classList.contains('fui-button')).toBeTrue();
    expect(button.classList.contains('fui-button--secondary')).toBeTrue();
  });

  it('applies custom className', () => {
    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="custom-class-button"]')
    );

    expect(
      buttonEl.nativeElement.classList.contains('custom-class')
    ).toBeTrue();
  });

  it('handles click events', () => {
    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="test-button"]')
    );
    const button = buttonEl.nativeElement.querySelector('button');

    expect(hostComponent.clicks).toBe(0);

    button.click();
    fixture.detectChanges();

    expect(hostComponent.clicks).toBe(1);
  });

  it('can be disabled', () => {
    const buttonEl = fixture.debugElement.query(
      By.css('[data-testid="disabled-button"]')
    );
    const button = buttonEl.query(By.css('button'));

    expect(button).toBeTruthy();
    expect(button.nativeElement.disabled).toBeTrue();
  });
});
