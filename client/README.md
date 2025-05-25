# IremehHub LMS - Client

This is the frontend client for the IremehHub Learning Management System, built with Next.js and TypeScript.

## TypeScript Configuration

The client side is already configured for TypeScript with:

1. TypeScript configuration:
   - `tsconfig.json` - Next.js TypeScript configuration
   - Type definitions for components and API responses

2. TypeScript best practices:
   - Use interfaces for component props
   - Type API responses and requests
   - Use proper type annotations for state and functions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm start` - Start the production server

## Converting JavaScript to TypeScript

For any remaining JavaScript files:

1. Rename the file from `.js` or `.jsx` to `.ts` or `.tsx`
2. Add type annotations to functions, variables, and component props
3. Create interfaces for component props and API data
4. Fix any type errors that arise

Example component conversion:

```tsx
// Before (JavaScript)
import React, { useState } from 'react';

const ExampleComponent = ({ title, items }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;

// After (TypeScript)
import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
}

interface ExampleComponentProps {
  title: string;
  items: Item[];
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ title, items }) => {
  const [count, setCount] = useState<number>(0);
  
  const handleClick = (): void => {
    setCount(count + 1);
  };
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleComponent;
```

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
