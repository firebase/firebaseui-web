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

import { render, screen } from '@testing-library/angular';

import { DividerComponent } from './divider.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

describe('<fui-divider>', () => {
  it.only('renders a divider with text', async () => {
    const { container } = await render(`<fui-divider><span>Hello</span></fui-divider>`, {
      imports: [DividerComponent, CommonModule, BrowserModule],
    });

    screen.debug();

    const textContainer = container.querySelector('.fui-divider__text');
    expect(textContainer).toBeTruthy();
  });
});
