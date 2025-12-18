# PhilScript Frontend

A modern Next.js frontend application for searching medical substances, companies, brands, and products. This project connects to the PhilScript backend GraphQL API.

## Features

- 🔍 **Unified Search**: Search across medical substances, companies, brands, and products
- 📱 **Responsive Design**: Modern, mobile-friendly UI
- 🎨 **Beautiful UI**: Built with Tailwind CSS and shadcn/ui components
- ⚡ **Fast**: Optimized GraphQL queries with Apollo Client
- 🔐 **Secure**: Integrated with Nhost for authentication and storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Access to the PhilScript backend GraphQL API

### Installation

1. Install dependencies:
```bash
npm install
# or
pnpm install
# or
yarn install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_NHOST_SUBDOMAIN=lfgwnrkyoofwbvejrpqm
NEXT_PUBLIC_NHOST_REGION=eu-central-1
NEXT_PUBLIC_NHOST_STORAGE_URL=https://lfgwnrkyoofwbvejrpqm.storage.eu-central-1.nhost.run
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
philscript-front/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main search page
│   ├── providers.tsx       # Apollo and Nhost providers
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── apollo-client.ts    # Apollo Client configuration
│   ├── nhost.ts            # Nhost client configuration
│   ├── graphql/
│   │   └── queries.ts      # GraphQL queries
│   └── utils.ts            # Utility functions
└── package.json
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_NHOST_SUBDOMAIN`: Your Nhost subdomain
- `NEXT_PUBLIC_NHOST_REGION`: Your Nhost region
- `NEXT_PUBLIC_NHOST_STORAGE_URL`: Your Nhost storage URL

## Search Functionality

The search bar allows you to search for:
- **Medical Substances**: Active pharmaceutical ingredients
- **Companies**: Pharmaceutical companies
- **Brands**: Brand names
- **Products**: Complete product information

Results are displayed in tabs, allowing you to filter by category or view all results together.

## Building for Production

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 15**: React framework
- **Apollo Client**: GraphQL client
- **Nhost**: Backend-as-a-Service
- **Tailwind CSS**: Styling
- **TypeScript**: Type safety
- **Lucide React**: Icons

## License

Private project - All rights reserved
