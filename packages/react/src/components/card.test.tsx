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

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from "./card";

afterEach(() => {
  cleanup();
});

describe("<Card />", () => {
  it("renders a card with children", () => {
    render(<Card data-testid="test-card">Card content</Card>);
    const card = screen.getByTestId("test-card");

    expect(card).toHaveClass("fui-card");
    expect(card).toHaveTextContent("Card content");
  });

  it("applies custom className", () => {
    render(
      <Card data-testid="test-card" className="custom-class">
        Card content
      </Card>
    );
    const card = screen.getByTestId("test-card");

    expect(card).toHaveClass("fui-card");
    expect(card).toHaveClass("custom-class");
  });

  it("passes other props to the div element", () => {
    render(
      <Card data-testid="test-card" aria-label="card">
        Card content
      </Card>
    );
    const card = screen.getByTestId("test-card");

    expect(card).toHaveClass("fui-card");
    expect(card).toHaveAttribute("aria-label", "card");
  });

  it("renders a complete card with all subcomponents", () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader data-testid="complete-header">
          <CardTitle>Card Title</CardTitle>
          <CardSubtitle>Card Subtitle</CardSubtitle>
        </CardHeader>
        <CardContent>
          <div>Card Body Content</div>
        </CardContent>
      </Card>
    );
  
    const card = screen.getByTestId("complete-card");
    const header = screen.getByTestId("complete-header");
    const title = screen.getByRole("heading", { name: "Card Title" });
    const subtitle = screen.getByText("Card Subtitle");
    const content = screen.getByText("Card Body Content");
  
    expect(card).toHaveClass("fui-card");
    expect(title).toHaveClass("fui-card__title");
    expect(subtitle).toHaveClass("fui-card__subtitle");
    expect(header).toHaveClass("fui-card__header");
    expect(content).toBeInTheDocument();
  
    // Check structure
    expect(header).toContainElement(title);
    expect(header).toContainElement(subtitle);
    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
  });


  describe("<CardHeader />", () => {
    it("renders a card header with children", () => {
      render(<CardHeader data-testid="test-header">Header content</CardHeader>);
      const header = screen.getByTestId("test-header");
  
      expect(header).toHaveClass("fui-card__header");
      expect(header).toHaveTextContent("Header content");
    });
  
    it("applies custom className", () => {
      render(
        <CardHeader data-testid="test-header" className="custom-header">
          Header content
        </CardHeader>
      );
      const header = screen.getByTestId("test-header");
  
      expect(header).toHaveClass("fui-card__header");
      expect(header).toHaveClass("custom-header");
    });
  });
  
  describe("<CardTitle />", () => {
    it("renders a card title with children", () => {
      render(<CardTitle>Title content</CardTitle>);
      const title = screen.getByRole("heading", { name: "Title content" });
  
      expect(title.className).toContain("fui-card__title");
      expect(title.tagName).toBe("H2");
    });
  
    it("applies custom className", () => {
      render(<CardTitle className="custom-title">Title content</CardTitle>);
      const title = screen.getByRole("heading", { name: "Title content" });
  
      expect(title).toHaveClass("fui-card__title");
      expect(title).toHaveClass("custom-title");
    });
  });
  
  describe("<CardSubtitle />", () => {
    it("renders a card subtitle with children", () => {
      render(<CardSubtitle>Subtitle content</CardSubtitle>);
      const subtitle = screen.getByText("Subtitle content");
  
      expect(subtitle).toHaveClass("fui-card__subtitle");
      expect(subtitle.tagName).toBe("P");
    });
  
    it("applies custom className", () => {
      render(<CardSubtitle className="custom-subtitle">Subtitle content</CardSubtitle>);
      const subtitle = screen.getByText("Subtitle content");
  
      expect(subtitle).toHaveClass("fui-card__subtitle");
      expect(subtitle).toHaveClass("custom-subtitle");
    });
  });
  
  describe("<CardContent />", () => {
    it("renders a card content with children", () => {
      render(<CardContent>Content content</CardContent>);
      const content = screen.getByText("Content content");
  
      expect(content).toHaveClass("fui-card__content");
      expect(content.tagName).toBe("DIV");
    });
  
    it("applies custom className", () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const content = screen.getByText("Content");
  
      expect(content).toHaveClass("fui-card__content");
      expect(content).toHaveClass("custom-content");
    });
  });
});
