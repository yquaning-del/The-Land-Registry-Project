# Blockchain Land Registry Platform

AI-Powered Land Verification System for Ghana & Nigeria

## 🌍 Project Overview

This is a Human-in-the-Loop blockchain land registry MVP designed specifically for the African market. The platform uses AI to verify physical land documents against satellite data before minting blockchain records, ensuring transparency and reducing land disputes.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **AI/ML**: Modular agent-based verification system
- **Icons**: Lucide React

### Key Features

- 📄 **Document Upload & Analysis**: AI-powered document verification
- 🗺️ **GPS Validation**: Satellite imagery cross-reference
- 🤖 **AI Confidence Scoring**: Every verification includes confidence scores (0.0-1.0)
- 👥 **Human-in-the-Loop**: Medium-confidence claims reviewed by experts
- 🔒 **Secure Authentication**: Role-based access control (Claimant, Verifier, Admin)
- ⛓️ **Blockchain Ready**: Infrastructure for NFT minting of approved claims

## 📁 Project Structure

```
land-registry-platform/
├── .windsurf/rules/          # Project coding standards
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard with claim intake form
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Reusable UI primitives
│   └── ClaimIntakeForm.tsx  # Main claim submission form
├── lib/                     # Business logic
│   ├── ai/                  # AI verification agents
│   ├── supabase/            # Database clients
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript definitions
│   ├── database.types.ts    # Supabase types
│   └── land-claim.types.ts  # Domain types
├── supabase/migrations/     # Database schema
└── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd "Land Registry Platform"
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Row Level Security policies

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Workflows

### Claim Submission Flow

1. User uploads land document (PDF/Image)
2. User provides GPS coordinates and property details
3. AI verification pipeline executes:
   - **Document Analysis Agent** (extracts text, validates format)
   - **GPS Validation Agent** (checks satellite data)
   - **Cross-Reference Agent** (checks for conflicts)
4. System calculates overall confidence score
5. Routing based on confidence:
   - **High (≥85%)**: Auto-approve with notification
   - **Medium (60-84%)**: Queue for human review
   - **Low (<60%)**: Require manual approval

### AI Verification Standards

All AI functions follow the "Vibe Coding" standards defined in `.windsurf/rules/project-standards.md`:

- ✅ TypeScript with strict typing
- ✅ Modular agentic logic (composable agents)
- ✅ Confidence scores on all AI outputs
- ✅ Comprehensive audit trails
- ✅ Human escalation paths

## 📊 Database Schema

### Core Tables

- **user_profiles**: Extended user information with roles
- **land_claims**: Main claims table with verification status
- **verification_logs**: Audit trail for all AI decisions
- **claim_disputes**: Dispute management system

### Key Fields in `land_claims`

- `original_document_url`: Uploaded document
- `gps_coordinates`: PostGIS POINT type
- `ai_verification_status`: Claim status enum
- `ai_confidence_score`: Decimal (0.00-1.00)
- `human_approver_id`: Verifier who reviewed the claim

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (RBAC)
- Secure file uploads to Supabase Storage
- Environment variables for sensitive data
- API rate limiting (to be implemented)

## 🌍 African Market Considerations

- **Multi-language support**: English, Twi, Yoruba, Igbo (planned)
- **Low-bandwidth optimization**: Progressive image loading
- **Offline-first capabilities**: Service worker caching (planned)
- **Local currency support**: GHS (Ghana Cedi), NGN (Nigerian Naira)
- **Cultural sensitivity**: Support for communal land claims

## 📝 Development Guidelines

See `.windsurf/rules/project-standards.md` for comprehensive coding standards including:

- TypeScript conventions
- Component architecture
- AI agent patterns
- Testing requirements
- Git workflow

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Environment Variables

Ensure all environment variables are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards in `.windsurf/rules/project-standards.md`
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- Built for the African land registry modernization initiative
- Designed with input from Ghana Lands Commission
- Satellite data integration partners (TBD)

## 📞 Support

For questions or support, contact the development team.

---

**Version**: 0.1.0 (MVP)  
**Last Updated**: February 2026  
**Status**: Active Development
# The-Land-Registry-Project
