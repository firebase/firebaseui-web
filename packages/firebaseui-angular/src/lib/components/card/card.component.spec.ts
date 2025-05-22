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

import {
  CardComponent,
  CardHeaderComponent,
  CardSubtitleComponent,
  CardTitleComponent,
} from './card.component';

// Test host components for individual components
@Component({
  template: `<fui-card class="custom-class" data-testid="test-card"
    >Card content</fui-card
  >`,
  standalone: true,
  imports: [CardComponent],
})
class TestCardHostComponent {}

@Component({
  template: `<fui-card-header class="custom-header" data-testid="test-header"
    >Header content</fui-card-header
  >`,
  standalone: true,
  imports: [CardHeaderComponent],
})
class TestCardHeaderHostComponent {}

@Component({
  template: `<fui-card-title class="custom-title"
    >Title content</fui-card-title
  >`,
  standalone: true,
  imports: [CardTitleComponent],
})
class TestCardTitleHostComponent {}

@Component({
  template: `<fui-card-subtitle class="custom-subtitle"
    >Subtitle content</fui-card-subtitle
  >`,
  standalone: true,
  imports: [CardSubtitleComponent],
})
class TestCardSubtitleHostComponent {}

// Test host for a complete card
@Component({
  template: `
    <fui-card data-testid="complete-card">
      <fui-card-header data-testid="complete-header">
        <fui-card-title>Card Title</fui-card-title>
        <fui-card-subtitle>Card Subtitle</fui-card-subtitle>
      </fui-card-header>
      <div>Card Body Content</div>
    </fui-card>
  `,
  standalone: true,
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardSubtitleComponent,
  ],
})
class TestCompleteCardHostComponent {}

describe('Card Components', () => {
  describe('CardComponent', () => {
    let component: TestCardHostComponent;
    let fixture: ComponentFixture<TestCardHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CardComponent, TestCardHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestCardHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a card with children', () => {
      const card = fixture.debugElement.query(
        By.css('[data-testid="test-card"]')
      );
      const cardDiv = card.query(By.css('.fui-card'));

      expect(cardDiv).toBeTruthy();
      expect(cardDiv.nativeElement.textContent).toContain('Card content');
    });

    it('applies custom className', () => {
      const card = fixture.debugElement.query(
        By.css('[data-testid="test-card"]')
      );
      const cardDiv = card.query(By.css('.fui-card'));

      expect(cardDiv).toBeTruthy();
      expect(cardDiv.nativeElement.classList.contains('fui-card')).toBeTruthy();
      // For Angular components, class is applied to the host, not directly to the inner div
      expect(
        card.nativeElement.classList.contains('custom-class')
      ).toBeTruthy();
    });
  });

  describe('CardHeaderComponent', () => {
    let component: TestCardHeaderHostComponent;
    let fixture: ComponentFixture<TestCardHeaderHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CardHeaderComponent, TestCardHeaderHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestCardHeaderHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a card header with children', () => {
      const header = fixture.debugElement.query(
        By.css('[data-testid="test-header"]')
      );
      const headerDiv = header.query(By.css('.fui-card__header'));

      expect(headerDiv).toBeTruthy();
      expect(headerDiv.nativeElement.textContent).toContain('Header content');
    });

    it('applies custom className', () => {
      const header = fixture.debugElement.query(
        By.css('[data-testid="test-header"]')
      );
      const headerDiv = header.query(By.css('.fui-card__header'));

      expect(headerDiv).toBeTruthy();
      expect(
        headerDiv.nativeElement.classList.contains('fui-card__header')
      ).toBeTruthy();
      // For Angular components, class is applied to the host, not directly to the inner div
      expect(
        header.nativeElement.classList.contains('custom-header')
      ).toBeTruthy();
    });
  });

  describe('CardTitleComponent', () => {
    let component: TestCardTitleHostComponent;
    let fixture: ComponentFixture<TestCardTitleHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CardTitleComponent, TestCardTitleHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestCardTitleHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a card title with children', () => {
      const title = fixture.debugElement.query(By.css('.fui-card__title'));

      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Title content');
      expect(title.nativeElement.tagName).toBe('H2');
    });

    it('applies custom className', () => {
      const titleHost = fixture.debugElement.query(By.css('fui-card-title'));
      const title = fixture.debugElement.query(By.css('.fui-card__title'));

      expect(title).toBeTruthy();
      expect(
        title.nativeElement.classList.contains('fui-card__title')
      ).toBeTruthy();
      expect(
        titleHost.nativeElement.classList.contains('custom-title')
      ).toBeTruthy();
    });
  });

  describe('CardSubtitleComponent', () => {
    let component: TestCardSubtitleHostComponent;
    let fixture: ComponentFixture<TestCardSubtitleHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CardSubtitleComponent, TestCardSubtitleHostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(TestCardSubtitleHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a card subtitle with children', () => {
      const subtitle = fixture.debugElement.query(
        By.css('.fui-card__subtitle')
      );

      expect(subtitle).toBeTruthy();
      expect(subtitle.nativeElement.textContent).toContain('Subtitle content');
      expect(subtitle.nativeElement.tagName).toBe('P');
    });

    it('applies custom className', () => {
      const subtitleHost = fixture.debugElement.query(
        By.css('fui-card-subtitle')
      );
      const subtitle = fixture.debugElement.query(
        By.css('.fui-card__subtitle')
      );

      expect(subtitle).toBeTruthy();
      expect(
        subtitle.nativeElement.classList.contains('fui-card__subtitle')
      ).toBeTruthy();
      expect(
        subtitleHost.nativeElement.classList.contains('custom-subtitle')
      ).toBeTruthy();
    });
  });

  describe('Complete Card', () => {
    let component: TestCompleteCardHostComponent;
    let fixture: ComponentFixture<TestCompleteCardHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          CardComponent,
          CardHeaderComponent,
          CardTitleComponent,
          CardSubtitleComponent,
          TestCompleteCardHostComponent,
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TestCompleteCardHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a complete card with all subcomponents', () => {
      const card = fixture.debugElement.query(
        By.css('[data-testid="complete-card"]')
      );
      const header = fixture.debugElement.query(
        By.css('[data-testid="complete-header"]')
      );
      const title = fixture.debugElement.query(By.css('.fui-card__title'));
      const subtitle = fixture.debugElement.query(
        By.css('.fui-card__subtitle')
      );
      const content = fixture.debugElement.query(
        By.css('div:not(.fui-card):not(.fui-card__header)')
      );

      expect(card).toBeTruthy();
      expect(header).toBeTruthy();
      expect(title).toBeTruthy();
      expect(subtitle).toBeTruthy();
      expect(content).toBeTruthy();

      expect(title.nativeElement.textContent).toContain('Card Title');
      expect(subtitle.nativeElement.textContent).toContain('Card Subtitle');
      expect(content.nativeElement.textContent).toContain('Card Body Content');

      // Check that the card contains the header and content
      const cardElement = card.query(By.css('.fui-card')).nativeElement;
      const headerElement = header.query(
        By.css('.fui-card__header')
      ).nativeElement;

      expect(cardElement.contains(headerElement)).toBeTruthy();
      expect(cardElement.contains(content.nativeElement)).toBeTruthy();
    });
  });
});
