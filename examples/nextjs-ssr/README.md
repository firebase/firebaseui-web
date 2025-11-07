This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) configured for **Server-Side Rendering (SSR)**.

This example demonstrates how to use Firebase UI with Next.js App Router using server-side rendering. Unlike the static export version (`nextjs`), this version uses Next.js SSR capabilities including:

- Server Components for initial page rendering
- Server-side authentication state checking using `getCurrentUser()` from `serverApp.ts`
- Server-side redirects using `redirect()` from `next/navigation`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Differences from Static Export Version

- **No `output: "export"`** in `next.config.ts` - enables SSR
- **Server Components** - Pages use `async` functions and `getCurrentUser()` from `serverApp.ts`
- **Server-side redirects** - Uses `redirect()` instead of client-side `useRouter().push()`
- **Server-side auth checks** - Authentication state is checked on the server before rendering

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) - learn about server-side rendering
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

This app can be deployed to Firebase Hosting or any Node.js hosting platform that supports Next.js SSR:

```bash
pnpm run deploy
```

For Firebase Hosting, ensure you have configured the hosting site `fir-ui-2025-nextjs-ssr` in your Firebase project.
