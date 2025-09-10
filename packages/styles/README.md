# @firebase-ui/styles

This package contains the styles for the FirebaseUI components.

## Installation

### With tailwind

If you are using Tailwind CSS in your project, you can import the source files directly into your project.

```css
@import "tailwindcss";
@import "@firebase-ui/styles/src/base.css";
```

### With CSS

Alternatively, you can import fully compiled CSS files into your project. This output contains both the tailwind styles and the FirebaseUI styles.

```jsx
import "@firebase-ui/styles/dist.css";
```

## Building

To build the styles into a single CSS file, run the following command:

```bash
pnpm build
```

This command will source the `src.css` file and output the compiled CSS to the `dist.css` file.

