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

describe('<fui-divider>', () => {
  it('renders a divider with no text', async () => {
    const { container } = await render(DividerComponent, {
      inputs: {
        label: undefined,
      }
    });

    const divider = container.querySelector('.fui-divider');
    expect(divider).toBeTruthy();
    expect(divider).toHaveClass('fui-divider');
    expect(divider?.querySelector('.fui-divider__line')).toBeTruthy();
    expect(divider?.querySelector('.fui-divider__text')).toBeFalsy();
  });

  it('renders a divider with text', async () => {
    const dividerText = 'OR';
    const { container } = await render(DividerComponent, {
      inputs: {
        label: dividerText,
      }
    });

    const divider = container.querySelector('.fui-divider');
    const textElement = screen.getByText(dividerText);

    expect(divider).toBeTruthy();
    expect(divider).toHaveClass('fui-divider');
    expect(divider?.querySelectorAll('.fui-divider__line')).toHaveLength(2);
    expect(textElement).toBeTruthy();
    expect(textElement.closest('.fui-divider__text')).toBeTruthy();
  });
});
