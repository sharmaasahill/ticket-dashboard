# Ticket Dashboard

A modern project management dashboard built with Next.js and NestJS, featuring email-based authentication, real-time ticket management, and collaborative workspace functionality.

## Live Demo

- **Frontend**: [https://ticket-dashboard-frontend.netlify.app](https://ticket-dashboard-frontend.netlify.app/)
- **Backend API**: [https://ticket-dashboard-backend-j8pu.onrender.com](https://ticket-dashboard-backend-j8pu.onrender.com)

## Features

### Authentication
- **Email-based OTP Login**: No password required, secure OTP verification
- **JWT Token Management**: Persistent authentication with automatic token refresh
- **Session Management**: Secure logout and session handling

### Project Management
- **Project CRUD Operations**: Create, read, update, and delete projects
- **Bulk Operations**: Select and delete multiple projects simultaneously
- **Project Dashboard**: Clean, organized view of all projects with metadata

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
- **Styling**: Custom CSS with Minimalist-inspired design
- **Drag & Drop**: @dnd-kit for smooth ticket management
- **HTTP Client**: Axios for API communication
- **Real-time**: Socket.io-client for live updates

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

## Architecture & Design Patterns

### Backend Design Patterns

#### 1. **Strategy Pattern** - Notification System
```typescript
interface NotificationStrategy {
  send(user: User, message: string): Promise<void>;
}

class EmailNotificationStrategy implements NotificationStrategy {
  async send(user: User, message: string): Promise<void> {
  }
}

class UINotificationStrategy implements NotificationStrategy {
  async send(user: User, message: string): Promise<void> {
  }
}
```

#### 2. **Factory Pattern** - Ticket Creation
```typescript
class TicketFactory {
  static createTicket(data: CreateTicketDto, author: User): Ticket {
    return {
      id: generateId(),
      title: data.title,
      description: data.description,
      status: TicketStatus.TODO,
      authorId: author.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
```

#### 3. **Observer Pattern** - Real-time Updates
```typescript
class RealtimeService {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }
  
  notify(data: any): void {
    this.observers.forEach(observer => observer.update(data));
  }
}
```

#### 4. **Repository Pattern** - Data Access
```typescript
@Injectable()
export class ProjectsRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: { tickets: true }
    });
  }
}
```

#### 5. **Module Pattern** - Dependency Injection
```typescript
@Module({
  imports: [PrismaModule, MailModule],
  providers: [ProjectsService, ProjectsRepository],
  controllers: [ProjectsController],
  exports: [ProjectsService]
})
export class ProjectsModule {}
```

### Frontend Architecture

#### State Management with Zustand
```typescript
interface AuthStore {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  email: null,
  login: (token, email) => set({ token, email }),
  logout: () => set({ token: null, email: null })
}));
```

#### Component Architecture
- **Atomic Design**: Reusable components with clear hierarchy
- **Custom Hooks**: Business logic separation from UI components
- **Type Safety**: Full TypeScript implementation across all components

## Database Design

### Why PostgreSQL?

**Chosen over NoSQL for the following reasons:**

1. **ACID Compliance**: Ensures data integrity for critical operations
2. **Relational Data**: Natural fit for user-project-ticket relationships
3. **Complex Queries**: Support for advanced filtering and reporting
4. **Data Consistency**: Strong consistency guarantees for collaborative features
5. **Mature Ecosystem**: Excellent tooling and community support

### Database Schema

```sql
-- Users table
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE "Project" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
);

-- Tickets table
CREATE TABLE "Ticket" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "TicketStatus" DEFAULT 'TODO',
  "projectId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
);

-- Activities table for notifications
CREATE TABLE "Activity" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("projectId") REFERENCES "Project"("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SendGrid account (for email notifications)

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
ticket-dashboard/
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
│   │   │   ├── page.tsx    # Login page
│   │   │   ├── projects/   # Project pages
│   │   │   └── globals.css # Global styles
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

## UI/UX Features

### Design Philosophy
- **Minimal & Clean**: Minimalist design language
- **Professional**: Business-ready interface
- **Responsive**: Works on all device sizes
- **Accessible**: High contrast and keyboard navigation

### Key UI Components
- **Login Page**: Clean OTP-based authentication
- **Project Dashboard**: Card-based project overview
- **Kanban Board**: Drag-and-drop ticket management
- **Real-time Notifications**: Live activity feed
- **Super User Toggle**: Password-protected admin mode

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for production
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in XSS prevention

## Performance Optimizations

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Bundle Analysis**: Optimized bundle sizes
- **Database Indexing**: Proper database indexes
- **Caching**: Strategic caching implementation

## Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

**Sahil Sharma**
- Email: i.sahilkrsharma@gmail.com
- GitHub: [@sharmaasahill](https://github.com/sharmaasahill)

## Acknowledgments

- Next.js team for the amazing framework
- NestJS team for the robust backend framework
- Prisma team for the excellent ORM
- SendGrid for email services
- All open-source contributors

---

**Note**: This project was built as a demonstration of modern full-stack development practices with TypeScript, featuring real-time collaboration, secure authentication, and professional UI/UX design.