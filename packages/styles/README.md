# @firebase-ui/styles

This package contains the styles for the FirebaseUI components.

## Installation

### With tailwind

If you are using Tailwind CSS in your project, you can import the source files directly into your project.

```css
@import "tailwindcss";
@import "@firebase-ui/styles/tailwind";
```

### With CSS

Alternatively, you can import fully compiled CSS files into your project. This output contains both the tailwind styles and the FirebaseUI styles.

```jsx
import "@firebase-ui/styles";
```

## Themes

The packages also exports themes which overrides the CSS variables with preset colors. These can be imported from your CSS:

```css
@import "tailwindcss";
@import "@firebase-ui/styles/tailwind";
@import "@firebase-ui/styles/themes/brualist";
```

## Building

To build the styles into a single CSS file, run the following command:

```bash
pnpm build
```

This command will source the `src.css` file and output the compiled CSS to the `dist.css` file.
