# Pulse

**Version 2.0** - A modern project management dashboard built with Next.js and NestJS, featuring email-based authentication, real-time ticket management, and collaborative workspace functionality. Experience a sleek dark theme interface with an elegant landing page and intuitive project management tools.

## Live Demo

- **Frontend**: [https://pulse-front.netlify.app](https://pulse-front.netlify.app/)
- **Backend API**: [https://ticket-dashboard-backend-j8pu.onrender.com](https://ticket-dashboard-backend-j8pu.onrender.com)

## Features

### Authentication
- **Email-based OTP Login**: No password required, secure OTP verification
- **JWT Token Management**: Persistent authentication with automatic token refresh
- **Session Management**: Secure logout and session handling

### Project Management
- **Project CRUD Operations**: Create, read, update, and delete projects
- **Bulk Operations**: Select and delete multiple projects simultaneously
- **Enhanced Dashboard**: Modern project dashboard with search, sorting, and view modes (grid/list)
- **Project Statistics**: Real-time statistics including total projects, tickets, and completion rates
- **Interactive Cards**: Hover effects, progress indicators, and quick actions

### Ticket Management
- **Kanban Board**: Drag-and-drop ticket management across status columns
- **Real-time Updates**: Instant synchronization across all connected users
- **Ticket CRUD**: Create, edit, and delete tickets with descriptions
- **Search Functionality**: Quick ticket search and filtering

### Super User Controls
- **Admin Toggle**: Password-protected super user mode
- **User Attribution**: Display who created/updated tickets when enabled
- **Secure Access**: Protected admin functionality with password verification

### Notifications
- **Real-time Activity Feed**: Live notifications for active users
- **Email Notifications**: Automated email alerts for offline team members
- **WebSocket Integration**: Instant updates across all connected clients

## Tech Stack

### Frontend
- **Framework**: Next.js 15.5.4 with TypeScript
- **State Management**: Zustand with persistence
- **Styling**: Custom CSS with modern dark theme (#0f0f0f, #1a1a1a, #2a2a2a)
- **UI Components**: Landing page with hero section, features showcase, and CTA
- **Drag & Drop**: @dnd-kit for smooth ticket management
- **HTTP Client**: Axios for API communication
- **Real-time**: Socket.io-client for live updates
- **Navigation**: Seamless routing with Next.js App Router

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Email Service**: SendGrid for OTP and notifications
- **Real-time**: Socket.io for WebSocket connections
- **Validation**: Class-validator for request validation

### Database
- **Type**: PostgreSQL (Relational Database)
- **ORM**: Prisma for type-safe database operations
- **Hosting**: Neon (Serverless PostgreSQL)

### Deployment
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: Neon PostgreSQL

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SendGrid account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sharmaasahill/pulse.git
cd pulse
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env # Configure your environment variables
npm run start:dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.local.example .env.local # Configure your environment variables
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ticket_dashboard"
JWT_SECRET="your-jwt-secret"
SUPER_PASSWORD="your-super-password"
SENDGRID_API_KEY="your-sendgrid-api-key"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Project Structure

```
pulse/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── projects/       # Project management
│   │   ├── tickets/        # Ticket management
│   │   ├── notifications/  # Notification system
│   │   ├── realtime/       # WebSocket gateway
│   │   ├── admin/          # Super user controls
│   │   ├── common/         # Shared utilities
│   │   └── prisma/         # Database schema
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   │   ├── page.tsx    # Landing page
│   │   │   ├── components/ # Reusable components (Navbar, LoginModal)
│   │   │   ├── projects/   # Project pages
│   │   │   └── globals.css # Global styles and theme variables
│   │   ├── lib/            # Utilities and API client
│   │   └── store/          # Zustand stores
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/issue-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP and get token

### Projects
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Tickets
- `GET /projects/:id/tickets` - Get project tickets
- `POST /tickets` - Create new ticket
- `PUT /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

### Admin
- `POST /admin/super-verify` - Verify super user password

## Deployment

### Frontend (Netlify)
1. Connect GitHub repository to Netlify
2. Set build command: `cd frontend && npm install && npm run build`
3. Set publish directory: `frontend/.next`
4. Configure environment variables

### Backend (Render)
1. Connect GitHub repository to Render
2. Set build command: `cd backend && npm install && npm run build`
3. Set start command: `cd backend && npm run start:prod`
4. Configure environment variables

### Database (Neon)
1. Create PostgreSQL database on Neon
2. Run migrations: `npx prisma migrate deploy`
3. Update DATABASE_URL in backend environment

## Version History

### Version 2.0 (Current)
- Complete rebranding to "Pulse"
- Modern dark theme implementation
- Enhanced landing page with hero section
- Improved project dashboard with search, sorting, and statistics
- Better navigation and user experience
- Removed emoji icons for professional appearance

### Version 1.0
- Initial release with basic project and ticket management
- Email-based OTP authentication
- Real-time collaboration features
- Kanban board with drag-and-drop

## Author

**Sahil Sharma**
- Email: i.sahilkrsharma@gmail.com
- GitHub: [@sharmaasahill](https://github.com/sharmaasahill)