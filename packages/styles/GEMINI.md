# Firebase UI Styles

This document provides context for the `@firebase-oss/ui-styles` package.

## Overview

The `@firebase-oss/ui-styles` package provides the core styling for all Firebase UI for Web components. It is framework-agnostic and offers multiple ways to be consumed.

1.  **CSS Files**: For direct use in projects. It provides different files depending on whether you use Tailwind CSS.
2.  **Component Variants**: It exports utilities using `cva` (Class Variance Authority) to programmatically apply styles, which is useful when building custom components.

A key feature of this package is its heavy reliance on CSS variables for theming, allowing for extensive customization of the UI's appearance.

## CSS Usage

Depending on your project's setup, you can include the styles in one of two ways.

### With Tailwind CSS

If your project uses Tailwind CSS, you should import the `tailwind` entry point directly into your main CSS file. This file contains the necessary base styles.

```css
/* In your global styles.css */
@import "@firebase-oss/ui-styles/tailwind";
```

### Without Tailwind CSS

If you are not using Tailwind CSS, you can import the pre-compiled distributed file in your main application entry point (e.g., `main.ts` or `App.tsx`):

```javascript
// In your main application file
import "@firebase-oss/ui-styles";
```

## Component Variants (CVA)

For developers building their own component libraries, this package exports `cva` configurations. This allows you to generate the correct CSS classes for different component variants.

Currently, it exports a `buttonVariant` helper.

### Example

Here is how you might use it in a React component:

```tsx
import { buttonVariant, ButtonVariant } from "@firebase-oss/ui-styles";
import { type ComponentProps } from "react";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariant({ variant, className })}
      {...props}
    />
  );
}
```

## Customization

The look and feel of the components can be customized by overriding the CSS variables defined in this package. You can redefine these variables in your own stylesheet under a `:root` or other selector.

For example, to change the primary color and the radius of cards:

```css

:root {
  --fui-primary: #007bff; /* Change to a shade of blue */
  --fui-radius-card: 1rem;   /* Change to a larger corner radius */
}
```

Here are some of the core variables available for theming:

- `--fui-primary`: The primary color for buttons and links.
- `--fui-primary-hover`: The hover state for primary elements.
- `--fui-primary-surface`: The text color used on primary-colored surfaces.
- `--fui-text`: The main body text color.
- `--fui-background`: The background color for card elements.
- `--fui-border`: The default border color.
- `--fui-radius`: The border radius for inputs.
- `--fui-radius-card`: The border radius for cards.