# Ticket Dashboard

A modern, full-stack project management tool built with Next.js, NestJS, and PostgreSQL. This application provides a Trello-style interface for managing projects and tickets with real-time collaboration features.

## Features

### Authentication
- **Email-based OTP Authentication**: No passwords required - secure login via email verification
- **JWT Token Management**: Secure session handling with automatic token refresh
- **Persistent Login**: Stay logged in across browser sessions

### Project Management
- **Create & Manage Projects**: Full CRUD operations for project management
- **Project Descriptions**: Add detailed descriptions to your projects
- **Bulk Operations**: Select and delete multiple projects at once
- **Project Search**: Quick project discovery and management

### Ticket Management
- **Kanban Board**: Drag-and-drop ticket management with three columns (To Do, In Progress, Done)
- **Real-time Updates**: See changes instantly as team members move tickets
- **Ticket CRUD**: Create, edit, and delete tickets with descriptions
- **Status Tracking**: Visual status indicators and progress tracking
- **Search Functionality**: Find tickets quickly with real-time search

### Advanced Features
- **Super User Mode**: Toggle to view who created/updated tickets (password protected)
- **Activity Feed**: Real-time activity notifications for active users
- **Email Notifications**: Automatic email updates for offline team members
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Shortcuts**: 
  - `Ctrl+N`: Create new ticket
  - `Ctrl+K`: Focus search
  - `Escape`: Close modals

## Tech Stack

### Frontend
- **Next.js 15.5.4**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management with persistence
- **DnD Kit**: Modern drag-and-drop functionality
- **Socket.io Client**: Real-time communication
- **Axios**: HTTP client for API requests

### Backend
- **NestJS**: Scalable Node.js framework
- **TypeScript**: Type-safe backend development
- **Prisma ORM**: Modern database toolkit
- **PostgreSQL**: Robust relational database
- **JWT**: Secure authentication
- **Socket.io**: Real-time WebSocket communication
- **Nodemailer**: Email service integration
- **Passport**: Authentication middleware

### Database
- **PostgreSQL**: Primary database
- **Prisma**: Database ORM and migrations
- **Real-time**: WebSocket connections for live updates

## Architecture

### Design Patterns

This project implements several industry-standard design patterns for maintainability and scalability:

#### 1. **Repository Pattern** (Data Access Layer)
- **Implementation**: Prisma ORM acts as the repository
- **Location**: `PrismaService` in `backend/src/prisma/`
- **Purpose**: Abstracts database operations from business logic
- **Benefits**: 
  - Easy to switch databases if needed
  - Centralized data access logic
  - Type-safe queries with TypeScript

#### 2. **Strategy Pattern** (Notification System)
- **Implementation**: NotificationsService determines notification strategy
- **Location**: `backend/src/notifications/notifications.service.ts`
- **Strategy Options**:
  - **Real-time Strategy**: WebSocket notifications for active users
  - **Email Strategy**: Email notifications for offline users
- **Purpose**: Dynamically choose notification method based on user status
- **Benefits**:
  - Flexible notification delivery
  - Easy to add new notification channels (SMS, push, etc.)

#### 3. **Observer Pattern** (Real-time Updates)
- **Implementation**: WebSocket Gateway broadcasts events
- **Location**: `backend/src/realtime/gateway.ts`
- **Purpose**: Multiple clients observe ticket changes and react automatically
- **Events**:
  - `ticket:updated` - Ticket created/updated/deleted
  - Clients auto-update UI when events are received
- **Benefits**:
  - True real-time collaboration
  - Decoupled communication between components

#### 4. **Module Pattern** (Dependency Injection)
- **Implementation**: NestJS module system
- **Location**: All `*.module.ts` files
- **Purpose**: Organize code into cohesive, reusable modules
- **Benefits**:
  - Clear separation of concerns
  - Testable components
  - Reusable services

#### 5. **Middleware Pattern** (Authentication)
- **Implementation**: JWT Guards and Passport Strategy
- **Location**: 
  - `backend/src/auth/jwt.guard.ts`
  - `backend/src/auth/jwt.strategy.ts`
- **Purpose**: Intercept requests to verify authentication
- **Benefits**:
  - Centralized auth logic
  - Protects routes declaratively with `@UseGuards()`

#### 6. **Factory Pattern** (Entity Creation)
- **Implementation**: Service methods create entities with defaults
- **Location**: `TicketsService.create()`, `ProjectsService.create()`
- **Purpose**: Standardize entity creation with default values
- **Example**: Auto-assign system user if no author provided
- **Benefits**:
  - Consistent entity initialization
  - Encapsulated creation logic

### Database Choice: PostgreSQL (SQL)

**Why PostgreSQL over NoSQL?**

After evaluating both SQL and NoSQL options, PostgreSQL was chosen for the following reasons:

1. **Relational Data Structure**:
   - Projects have owners (Users)
   - Tickets belong to Projects and have Authors (Users)
   - Activities track changes to Tickets and Projects
   - These relationships are naturally represented in SQL with foreign keys

2. **ACID Compliance**:
   - Critical for project management where data consistency matters
   - Ensures ticket status updates are atomic
   - Prevents data corruption during concurrent operations

3. **Complex Queries**:
   - Need to join Projects, Tickets, Users, and Activities
   - SQL provides efficient JOIN operations
   - Aggregations for ticket counts, activity feeds

4. **Data Integrity**:
   - Foreign key constraints ensure referential integrity
   - Cascade deletes handle project/ticket removal cleanly
   - Unique constraints on email addresses

5. **Prisma ORM**:
   - Excellent PostgreSQL support
   - Type-safe database access
   - Automatic migrations

**When NoSQL Would Be Better:**
- If we needed horizontal scaling across multiple servers
- If data structure was highly variable/unstructured
- If we prioritized write performance over consistency
- For document-based or key-value storage patterns

For this project management system, the structured, relational nature of the data and need for strong consistency made PostgreSQL the clear choice.

### Database Schema
- **Users**: Authentication and user management
- **Projects**: Project entities with owner relationships
- **Tickets**: Task management with status tracking
- **Activities**: Audit trail for all actions
- **Memberships**: Project team management
- **OTP Tokens**: Secure authentication codes

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sharmaasahill/ticket-dashboard.git
   cd ticket-dashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database and email configuration
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Start the backend server
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ticket_dashboard"
JWT_SECRET="your-super-secret-jwt-key"
SUPER_PASSWORD="your-super-user-password"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Usage

### Getting Started
1. **Login**: Enter your email address to receive a verification code
2. **Create Project**: Click "New Project" to create your first project
3. **Add Tickets**: Create tickets and organize them in the Kanban board
4. **Collaborate**: Invite team members and work together in real-time

### Project Management
- **Create Projects**: Add projects with names and descriptions
- **Edit Projects**: Update project details anytime
- **Delete Projects**: Remove projects (with confirmation)
- **Bulk Operations**: Select multiple projects for batch actions

### Ticket Management
- **Create Tickets**: Add tickets with titles and descriptions
- **Drag & Drop**: Move tickets between columns to update status
- **Edit Tickets**: Update ticket details inline
- **Search Tickets**: Use Ctrl+K to quickly find tickets
- **Real-time Updates**: See changes instantly from other users

### Super User Features
- **Toggle Super Mode**: Click the super user toggle (password required)
  - **Default Password**: `admin123` (change in `.env` file with `SUPER_PASSWORD`)
- **View Authors**: See who created and updated tickets
- **Enhanced Visibility**: Additional information for project management

## Development

### Project Structure
```
ticket-dashboard/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── projects/       # Project management
│   │   ├── tickets/        # Ticket management
│   │   ├── activities/     # Activity logging
│   │   ├── realtime/       # WebSocket gateway
│   │   └── common/         # Shared utilities
│   └── prisma/             # Database schema and migrations
├── frontend/               # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── lib/            # API and utility functions
│   │   └── store/          # Zustand state management
└── README.md
```

### API Endpoints

#### Authentication
- `POST /auth/issue-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP and get JWT token

#### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

#### Tickets
- `GET /tickets/:id` - Get ticket details
- `POST /tickets` - Create new ticket
- `PATCH /tickets/:id` - Update ticket
- `DELETE /tickets/:id` - Delete ticket

#### Activities
- `GET /activities/:projectId` - Get project activity feed

### Database Schema

#### Core Models
- **User**: User authentication and profile
- **Project**: Project entities with metadata
- **Ticket**: Task management with status tracking
- **Activity**: Audit trail and notifications
- **Membership**: Project team relationships
- **OtpToken**: Secure authentication codes

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL` to your backend URL
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables (database, JWT secret, SMTP)
3. Deploy with automatic builds

### Database (Neon/PostgreSQL)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in backend environment
3. Run migrations: `npx prisma migrate deploy`

## Contributing

This is a personal project developed over a week. The codebase is structured for maintainability and scalability.

### Development Guidelines
- Use TypeScript for all new code
- Follow existing patterns and conventions
- Test all features before deployment
- Keep the codebase clean and documented

## License

MIT License - see LICENSE file for details.

## Author

**Sahil Sharma**
- GitHub: [@sharmaasahill](https://github.com/sharmaasahill)
- Email: i.sahilkrsharma@gmail.com

---

Built using modern web technologies.