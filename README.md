# Legal Advisor User Frontend

React-based user interface for the Legal Advisor system. Ask legal questions in English, Hindi, or Bengali and get instant AI-powered responses with citations.

## Setup

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <frontend-repo-url>
   cd legal-advisor-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and set your backend API URL
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

See `.env.example` for all available configuration options.

## Features
- Multi-language support (English, Hindi, Bengali)
- RAG-based legal question answering
- Source citations from Indian legal documents
- Conversation history
- Real-time responses
