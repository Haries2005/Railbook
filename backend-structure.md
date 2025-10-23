# Backend File Structure for Railbook

## Project Structure
```
railbook-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── trainController.js
│   │   ├── bookingController.js
│   │   ├── seatController.js
│   │   └── notificationController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Train.js
│   │   ├── Booking.js
│   │   ├── Seat.js
│   │   └── Passenger.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── trains.js
│   │   ├── bookings.js
│   │   ├── seats.js
│   │   └── notifications.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiting.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── pdfService.js
│   │   ├── paymentService.js
│   │   └── seatAllocationService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── logger.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   ├── email.js
│   │   ├── sms.js
│   │   └── app.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── api.md
│   └── deployment.md
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## API Endpoints

### Authentication Routes (`/api/auth`)
```javascript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Train Routes (`/api/trains`)
```javascript
GET    /api/trains/search?trainNumber=&source=&destination=&journeyDate=
GET    /api/trains/:id
POST   /api/trains (Admin only)
PUT    /api/trains/:id (Admin only)
DELETE /api/trains/:id (Admin only)
GET    /api/trains/:id/availability?journeyDate=&class=
```

### Booking Routes (`/api/bookings`)
```javascript
POST   /api/bookings
GET    /api/bookings (User's bookings)
GET    /api/bookings/:pnr
PUT    /api/bookings/:pnr/cancel
GET    /api/bookings/:pnr/ticket (PDF download)
POST   /api/bookings/:pnr/resend-notifications
```

### Seat Routes (`/api/seats`)
```javascript
GET    /api/seats/availability/:trainId?journeyDate=&class=
POST   /api/seats/hold (Temporary seat hold)
POST   /api/seats/release (Release held seats)
GET    /api/seats/layout/:trainId/:class
```

### Notification Routes (`/api/notifications`)
```javascript
POST   /api/notifications/email
POST   /api/notifications/sms
GET    /api/notifications/status/:bookingId
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Trains Table
```sql
CREATE TABLE trains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number VARCHAR(10) UNIQUE NOT NULL,
    train_name VARCHAR(255) NOT NULL,
    source_station VARCHAR(255) NOT NULL,
    destination_station VARCHAR(255) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    journey_duration INTERVAL,
    days_of_operation JSON, -- ['monday', 'tuesday', ...]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Train Classes Table
```sql
CREATE TABLE train_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_id UUID REFERENCES trains(id) ON DELETE CASCADE,
    class_name VARCHAR(10) NOT NULL, -- 'SL', '3A', '2A', '1A', etc.
    total_seats INTEGER NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    seat_layout JSON, -- Seat arrangement configuration
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pnr VARCHAR(10) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    train_id UUID REFERENCES trains(id),
    journey_date DATE NOT NULL,
    class_name VARCHAR(10) NOT NULL,
    total_passengers INTEGER NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_status ENUM('confirmed', 'waitlisted', 'cancelled') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    contact_mobile VARCHAR(15) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Passengers Table
```sql
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    aadhar_number VARCHAR(12),
    seat_number VARCHAR(10),
    berth_preference ENUM('lower', 'middle', 'upper', 'side-lower', 'side-upper'),
    seat_status ENUM('confirmed', 'waitlisted') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Seats Table
```sql
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_id UUID REFERENCES trains(id),
    class_name VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    berth_type ENUM('lower', 'middle', 'upper', 'side-lower', 'side-upper'),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(train_id, class_name, seat_number)
);
```

### Seat Bookings Table
```sql
CREATE TABLE seat_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id UUID REFERENCES seats(id),
    booking_id UUID REFERENCES bookings(id),
    passenger_id UUID REFERENCES passengers(id),
    journey_date DATE NOT NULL,
    status ENUM('booked', 'held', 'cancelled') DEFAULT 'booked',
    held_until TIMESTAMP, -- For temporary holds during booking process
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seat_id, journey_date, status) WHERE status = 'booked'
);
```

## Key Backend Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (user/admin)
- Password hashing with bcrypt
- Rate limiting for login attempts

### 2. Train Management
- CRUD operations for trains
- Dynamic pricing based on demand
- Real-time availability checking
- Route optimization

### 3. Booking System
- Atomic booking transactions
- Seat allocation algorithm
- Waitlist management
- Booking confirmation workflow

### 4. Seat Management
- Real-time seat availability
- Temporary seat holding during booking
- Automatic seat assignment
- Berth preference handling

### 5. Notification Services
- Email notifications (booking confirmation, cancellation)
- SMS notifications (booking updates, journey reminders)
- Push notifications (mobile app)
- Notification templates and scheduling

### 6. Payment Integration
- Multiple payment gateway support
- Secure payment processing
- Refund management
- Payment status tracking

### 7. PDF Generation
- Professional ticket generation
- QR code integration
- Email attachment support
- Template customization

## Environment Variables (.env)
```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/railbook
DATABASE_SSL=false

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Email Service (SendGrid/Nodemailer)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@railbook.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway (Stripe/Razorpay)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# File Storage (AWS S3/Cloudinary)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=railbook-assets

# Application
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Deployment Configuration

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

This backend structure provides a comprehensive foundation for the Railbook application with proper separation of concerns, scalability, and maintainability.