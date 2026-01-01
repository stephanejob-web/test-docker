# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Light Church is a church directory and events platform with three applications:
- **Backend**: Express.js REST API with MySQL database
- **Frontend**: React (Vite) web application for public map and admin dashboard
- **Mobile**: React Native (Expo) mobile application

## Development Commands

### Docker (Recommended for Development)

```bash
# Start all services (backend, frontend, MySQL)
docker-compose up -d --build

# Rebuild specific service after code changes
docker-compose up -d --build backend
docker-compose up -d --build frontend

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Stop all services
docker-compose down
```

**IMPORTANT**: Code changes require rebuild (`--build` flag) as there's no hot-reload in Docker mode.

### Backend (Express)

```bash
cd backend-express

# Install dependencies
npm install

# Run tests
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report

# Database operations (inside Docker container)
docker exec mysql-db mysql -u root -p${MYSQL_ROOT_PASSWORD} light_church
```

### Frontend (React + Vite)

```bash
cd frontend-react

# Install dependencies
npm install

# Development
npm run dev                # Start dev server (outside Docker)

# Build
npm run build              # TypeScript + Vite build

# Tests
npm test                   # Run Vitest tests
npm run test:ui            # Vitest UI
npm run test:coverage      # Coverage report

# Linting
npm run lint
```

### Mobile (React Native + Expo)

```bash
cd light-church-mobile

# Install dependencies
npm install

# Development
npm start                  # Start Expo dev server
npm run android           # Run on Android
npm run ios              # Run on iOS
npm run web             # Run in browser

# Linting
npm run lint
```

## Architecture

### Database Schema

MySQL database with key tables:
- **admins**: Users with roles (SUPER_ADMIN, PASTOR, EVANGELIST) and status (PENDING, VALIDATED, REJECTED, SUSPENDED)
- **churches**: Church locations with PostGIS point data (location, latitude, longitude)
- **church_details**: Extended church information (pastor name split into first/last, address fields, parking, social links)
- **events**: Church events with timestamps (created_at, updated_at, start_datetime, end_datetime, cancelled_at)
- **event_interests**: Tracks user interest in events (device_id from push_tokens table)
- **push_tokens**: Expo push notification tokens for mobile devices
- **denominations**: Church denominations with optional union affiliation
- **church_schedules**: Service schedules with day_of_week and time
- **church_socials**: Social media links (facebook, instagram, youtube, twitter, tiktok)
- **church_activities**: Many-to-many relationship with activity_types

**Key patterns**:
- Generated columns for latitude/longitude from PostGIS point
- Pastor name stored as separate first_name/last_name fields
- Event status computed dynamically from dates and cancellation state (not stored)
- Address split into street_number, street_name, postal_code, city

### Backend Structure (backend-express/)

```
app.js                    # Express app entry point
config/db.js             # MySQL connection pool
middleware/
  authMiddleware.js      # JWT verification, role checks (verifyToken, requireSuperAdmin, requirePastor)
routes/
  authRoutes.js          # POST /api/auth/register, /login
  adminRoutes.js         # SUPER_ADMIN only routes
  churchRoutes.js        # PASTOR routes for managing own church
  pastorRoutes.js        # PASTOR network features
  publicMapRoutes.js     # Public API (no auth) - events, churches, filters
  uploadRoutes.js        # Image upload (multer)
  settingsRoutes.js      # App settings
validators/
  authValidator.js       # express-validator rules
  churchValidator.js     # Church form validation
  eventValidator.js      # Event validation
utils/
  eventStatus.js         # enrichEventWithStatus() - computes status from dates
cron/
  eventCron.js          # Disabled - status is dynamic now
```

**Authentication flow**:
1. JWT tokens in Authorization header: `Bearer <token>`
2. Middleware decodes token → `req.user = { id, email, role, church_id }`
3. Role-based access: SUPER_ADMIN can do everything, PASTOR manages own church only
4. Pastor registration requires SUPER_ADMIN validation (status: PENDING → VALIDATED)

**Event status logic** (utils/eventStatus.js):
- Status computed dynamically, not stored in database
- CANCELLED: if cancelled_at is set
- UPCOMING: start_datetime in future
- ONGOING: between start_datetime and end_datetime
- COMPLETED: end_datetime in past

### Frontend Structure (frontend-react/src/)

```
App.tsx                  # React Router setup with role-based routes
context/
  AuthContext.tsx        # JWT auth state, login/logout, role checks
components/
  Layout.tsx             # Dashboard layout with sidebar navigation
  ProtectedRoute.tsx     # Route guard checking auth + roles
  Map/                   # Public map components (SearchBar, FilterDrawer, ResultsPanel)
  ErrorBoundary.tsx      # Error boundary wrapper
pages/
  public/HomePage.tsx    # Public church map (no auth)
  Login.tsx             # Login page
  Register.tsx          # Pastor registration (awaits admin approval)
  DashboardHome.tsx     # Dashboard landing page
  MyChurch.tsx          # PASTOR: Edit own church details
  MyEvents.tsx          # PASTOR: Manage church events
  PastorNetwork.tsx     # PASTOR: View other churches/pastors
  Admin*.tsx            # SUPER_ADMIN: User/church/event management
lib/
  validationSchemas.ts       # Zod schemas for forms (200+ tests)
  validationSchemas.test.ts  # Comprehensive validation tests
services/
  # API calls using axios
theme/theme.ts           # Material-UI theme configuration
```

**Key patterns**:
- Material-UI (MUI) for UI components
- React Hook Form + Zod for form validation
- Leaflet for maps (react-leaflet, react-leaflet-cluster)
- Axios for API calls with interceptors for auth headers
- Role-based routing with nested ProtectedRoute components

**Validation approach**:
- Frontend: Zod schemas provide comprehensive validation (primary validation layer)
- Backend: express-validator provides documentation and safety net
- Tests focus on frontend validation (200+ tests), backend tests are simplified

### Mobile Structure (light-church-mobile/)

```
app/                     # Expo Router file-based routing
  (tabs)/               # Bottom tab navigation
  church/[id].tsx      # Church details screen
  event/[id].tsx       # Event details with interest button
  _layout.tsx          # Root layout
services/
  pushNotificationService.ts  # Expo notifications setup, token registration
hooks/
  query/
    useEventInterest.ts      # React Query hooks for event interests
types/
  event.ts                   # TypeScript interfaces
components/
  cards/EventCard.tsx        # Event card with interested count badge
```

**Key patterns**:
- Expo Router for navigation (file-based routing)
- React Query (@tanstack/react-query) for API state management
- Expo notifications for push notifications
- AsyncStorage for device_id persistence
- Bottom sheet for modals (@gorhom/bottom-sheet)
- Flash list for performant lists (@shopify/flash-list)

**Push notification flow**:
1. User clicks "Ça m'intéresse" on event
2. App requests notification permission (first time only)
3. Registers Expo push token → backend stores in push_tokens table
4. Generates unique device_id → stored in AsyncStorage
5. POST /api/public/events/:id/interest with device_id
6. Backend increments interested_count, stores in event_interests table

## API Endpoints

### Public (No Authentication)

```
GET  /api/public/events                    # List events with filters
GET  /api/public/events/:id                # Event details
GET  /api/public/churches                  # List churches with filters
POST /api/public/events/:id/interest       # Register interest (requires device_id)
DELETE /api/public/events/:id/interest     # Remove interest
GET  /api/public/events/:id/interested-count
GET  /api/public/events/:id/is-interested?device_id=
```

### Authentication

```
POST /api/auth/register                    # Pastor registration (status: PENDING)
POST /api/auth/login                       # Returns JWT token
```

### Pastor Routes (Requires PASTOR or SUPER_ADMIN role)

```
GET  /api/church                           # Get own church details
PUT  /api/church                           # Update own church
POST /api/church/events                    # Create event
PUT  /api/church/events/:id                # Update own event
DELETE /api/church/events/:id              # Delete own event
```

### Admin Routes (Requires SUPER_ADMIN role)

```
GET  /api/admin/registrations              # List pending registrations
PUT  /api/admin/registrations/:id          # Validate/reject registration
GET  /api/admin/users                      # List all users
GET  /api/admin/churches                   # List all churches
PUT  /api/admin/churches/:id               # Edit any church
GET  /api/admin/events                     # List all events
```

## Common Development Patterns

### Adding a New Field to Church

1. **Database**: Add column in migration SQL file
2. **Backend validator**: Update `churchValidator.js` with express-validator rules
3. **Frontend schema**: Update Zod schema in `validationSchemas.ts`
4. **Frontend tests**: Add test cases in `validationSchemas.test.ts`
5. **Frontend types**: Update TypeScript interface if needed
6. **UI**: Add form field in `MyChurch.tsx`

### Creating a New API Endpoint

1. **Route file**: Add route in appropriate file (adminRoutes.js, churchRoutes.js, etc.)
2. **Validation**: Add express-validator middleware if needed
3. **Authorization**: Apply middleware (verifyToken, requireSuperAdmin, requirePastor)
4. **Database query**: Use connection pool from `config/db.js`
5. **Frontend service**: Create API call function
6. **Frontend integration**: Use in component with React Query (mobile) or useState (web)

### Handling Event Status

Events don't have a stored status column. Use `enrichEventWithStatus()` utility:

```javascript
const { enrichEventWithStatus } = require('../utils/eventStatus');

const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
const event = enrichEventWithStatus(rows[0]); // Adds computed status field
```

## Testing

### Frontend Validation Tests (Primary)

Location: `frontend-react/src/lib/validationSchemas.test.ts`

**200+ comprehensive tests covering**:
- All required fields (church_name, denomination_id, address, phone, pastor names, coordinates)
- Optional fields (description, website, parking, socials)
- Edge cases (addresses without street numbers, names with accents, various phone formats)
- Field constraints (min/max lengths, regex patterns, value ranges)

Run before commits: `cd frontend-react && npm test`

### Backend Tests (Documentation)

Location: `backend-express/validators/churchValidator.test.js`

Simplified tests documenting validation rules. Run: `cd backend-express && npm test`

## Environment Variables

Required in `.env` at project root (used by docker-compose.yml):

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=light_church
MYSQL_USER=light_user
MYSQL_PASSWORD=light_password
JWT_SECRET=your_secret_key
```

Backend also reads from `backend-express/.env` when running outside Docker.

## Database Migrations

Location: `backend-express/migrations/`

Execute migration inside Docker:
```bash
docker exec mysql-db mysql -u root -p${MYSQL_ROOT_PASSWORD} light_church < backend-express/migrations/your_migration.sql
```

Or use provided SQL dumps:
- `bas_ok.sql` - Current schema with sample data (auto-loaded by docker-compose)
- `database_dump.sql` - Backup dumps

## Key Files to Review

- `backend-express/routes/publicMapRoutes.js` - Complex filtering and geospatial queries
- `frontend-react/src/lib/validationSchemas.ts` - All form validation rules
- `backend-express/middleware/authMiddleware.js` - Authentication logic
- `frontend-react/src/App.tsx` - Route structure and role-based access
- `IMPLEMENTATION_SUMMARY.md` - Detailed event interest feature documentation
- `TESTS_README.md` - Complete testing guide for beginners

## Ports

- Frontend: http://localhost (port 80)
- Backend API: http://localhost:3000
- MySQL: localhost:3306
- Expo dev: Check terminal after `npm start` in light-church-mobile/

## Notes

- The `website/` directory contains a static marketing site (separate from main app)
- Temporary route files (temp1.js, temp2.js, etc.) in backend-express/routes/ should be ignored
- The demonstration/ folder contains demo content/screenshots
- Pastor name is stored as first_name/last_name (not a single name field)
- Street number is OPTIONAL (some addresses don't have numbers)
- Event status is ALWAYS computed dynamically using enrichEventWithStatus()
- All coordinates use PostGIS point type with generated virtual columns for lat/lng
