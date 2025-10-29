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

import { render, screen } from "@testing-library/angular";

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardSubtitleComponent,
  CardContentComponent,
} from "./card";

describe("<fui-card>", () => {
  it("renders a card with children", async () => {
    await render(`<fui-card data-testid="test-card"><fui-card-content>Card content</fui-card-content></fui-card>`, {
      imports: [CardComponent, CardContentComponent],
    });
    const card = screen.getByTestId("test-card");
    const cardDiv = card.querySelector(".fui-card");

    expect(cardDiv).toHaveClass("fui-card");
    expect(cardDiv).toHaveTextContent("Card content");
  });

  it("applies custom class", async () => {
    await render(
      `<fui-card data-testid="test-card" class="custom-class"><fui-card-content>Card content</fui-card-content></fui-card>`,
      { imports: [CardComponent, CardContentComponent] }
    );
    const card = screen.getByTestId("test-card");
    const cardDiv = card.querySelector(".fui-card");

    expect(cardDiv).toHaveClass("fui-card");
    expect(card).toHaveClass("custom-class");
  });

  it("passes other props to the div element", async () => {
    await render(
      `<fui-card data-testid="test-card" aria-label="card"><fui-card-content>Card content</fui-card-content></fui-card>`,
      { imports: [CardComponent, CardContentComponent] }
    );
    const card = screen.getByTestId("test-card");
    const cardDiv = card.querySelector(".fui-card");

    expect(cardDiv).toHaveClass("fui-card");
    expect(card).toHaveAttribute("aria-label", "card");
  });

  it("renders a complete card with all subcomponents", async () => {
    await render(
      `
      <fui-card data-testid="complete-card">
        <fui-card-header data-testid="complete-header">
          <fui-card-title>Card Title</fui-card-title>
          <fui-card-subtitle>Card Subtitle</fui-card-subtitle>
        </fui-card-header>
        <fui-card-content>
          <div>Card Body Content</div>
        </fui-card-content>
      </fui-card>
    `,
      {
        imports: [CardComponent, CardHeaderComponent, CardTitleComponent, CardSubtitleComponent, CardContentComponent],
      }
    );

    const card = screen.getByTestId("complete-card");
    const header = screen.getByTestId("complete-header");
    const title = screen.getByRole("heading", { name: "Card Title" });
    const subtitle = screen.getByText("Card Subtitle");
    const content = screen.getByText("Card Body Content");

    expect(card.querySelector(".fui-card")).toHaveClass("fui-card");
    expect(title).toHaveClass("fui-card__title");
    expect(subtitle).toHaveClass("fui-card__subtitle");
    expect(header.querySelector(".fui-card__header")).toHaveClass("fui-card__header");
    expect(content).toBeTruthy();

    expect(header).toContainElement(title);
    expect(header).toContainElement(subtitle);
    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
  });

  describe("<fui-card-header>", () => {
    it("renders a card header with children", async () => {
      await render(
        `<fui-card-header data-testid="test-header"><fui-card-title>Header content</fui-card-title></fui-card-header>`,
        { imports: [CardHeaderComponent, CardTitleComponent] }
      );
      const header = screen.getByTestId("test-header");
      const headerDiv = header.querySelector(".fui-card__header");

      expect(headerDiv).toHaveClass("fui-card__header");
      expect(headerDiv).toHaveTextContent("Header content");
    });

    it("applies custom className", async () => {
      await render(
        `<fui-card-header data-testid="test-header" class="custom-header"><fui-card-title>Header content</fui-card-title></fui-card-header>`,
        { imports: [CardHeaderComponent, CardTitleComponent] }
      );
      const header = screen.getByTestId("test-header");
      const headerDiv = header.querySelector(".fui-card__header");

      expect(headerDiv).toHaveClass("fui-card__header");
      expect(header).toHaveClass("custom-header");
    });
  });

  describe("<fui-card-title>", () => {
    it("renders a card title with children", async () => {
      await render(`<fui-card-title>Title content</fui-card-title>`, { imports: [CardTitleComponent] });
      const title = screen.getByRole("heading", { name: "Title content" });

      expect(title).toHaveClass("fui-card__title");
      expect(title.tagName).toBe("H2");
    });

    it("applies custom className", async () => {
      await render(`<fui-card-title data-testid="title-host" class="custom-title">Title content</fui-card-title>`, {
        imports: [CardTitleComponent],
      });
      const title = screen.getByRole("heading", { name: "Title content" });
      const titleHost = screen.getByTestId("title-host");

      expect(title).toHaveClass("fui-card__title");
      expect(titleHost).toHaveClass("custom-title");
    });
  });

  describe("<fui-card-subtitle>", () => {
    it("renders a card subtitle with children", async () => {
      await render(`<fui-card-subtitle>Subtitle content</fui-card-subtitle>`, { imports: [CardSubtitleComponent] });
      const subtitle = screen.getByText("Subtitle content");

      expect(subtitle).toHaveClass("fui-card__subtitle");
      expect(subtitle.tagName).toBe("P");
    });

    it("applies custom className", async () => {
      await render(
        `<fui-card-subtitle data-testid="subtitle-host" class="custom-subtitle">Subtitle content</fui-card-subtitle>`,
        { imports: [CardSubtitleComponent] }
      );
      const subtitle = screen.getByText("Subtitle content");
      const subtitleHost = screen.getByTestId("subtitle-host");

      expect(subtitle).toHaveClass("fui-card__subtitle");
      expect(subtitleHost).toHaveClass("custom-subtitle");
    });
  });

  describe("<fui-card-content>", () => {
    it("renders a card content with children", async () => {
      await render(`<fui-card-content>Content content</fui-card-content>`, { imports: [CardContentComponent] });
      const content = screen.getByText("Content content");

      expect(content).toHaveClass("fui-card__content");
      expect(content.tagName).toBe("DIV");
    });

    it("applies custom className", async () => {
      await render(`<fui-card-content data-testid="content-host" class="custom-content">Content</fui-card-content>`, {
        imports: [CardContentComponent],
      });
      const content = screen.getByText("Content");
      const contentHost = screen.getByTestId("content-host");

      expect(content).toHaveClass("fui-card__content");
      expect(contentHost).toHaveClass("custom-content");
    });
  });
});
