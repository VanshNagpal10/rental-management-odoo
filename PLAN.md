# Rental Management MVP - Project Plan

## Goal
Build a minimal yet visually impactful Rental Management web application within 24 hours for hackathon demo. Focus on core flows that impress mentors and judges while faking non-essential features.

## Tech Stack
- **Frontend + Backend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (cloud)
- **Charts**: Chart.js
- **Payment**: Razorpay test mode (simulated)
- **Auth**: NextAuth.js with credentials
- **Logging**: Winston
- **Hosting**: Vercel + MongoDB Atlas

## Core Features (Must Implement)

### 1. Rental Products & Booking Flow
- ✅ Add Rentable Product: Name, photo, pricing per hour/day/week, availability toggle
- ✅ Browse Products: Grid/list view with product details
- ✅ Book Rental: Date picker, auto-calculate total cost
- ✅ Availability Check: Static calendar with simulated blocked dates

### 2. Admin Dashboard & Reservations
- ✅ Bookings List: All bookings with status (Confirmed/Pending/Returned/Late)
- ✅ KPIs: Total rentals, daily bookings, revenue summary (dummy data)
- ✅ Late Fee Simulation: Auto-add ₹50/day for overdue returns

### 3. Fake Payment & Notifications
- ✅ Simulated Payment: Razorpay test mode OR success modal
- ✅ Notification Simulation: Due date reminders (hard-coded)

## User Roles

### End User
- Business owners who own products and rent them out
- Manage product inventory, pricing, and rental orders
- Access to business dashboard, reports, and customer management

### Customer  
- People who rent products from end users
- Browse available products, make bookings, and manage their rentals
- Access to rental history and payment management

## Database Models (MongoDB: "rimo")

### Product
```javascript
{
  name: String,
  image: String,
  description: String,
  category: String,
  pricePerHour: Number,
  pricePerDay: Number,
  pricePerWeek: Number,
  pricePerMonth: Number,
  pricePerYear: Number,
  availability: Boolean,
  endUserId: ObjectId, // Owner of the product
  units: String, // 'hour', 'day', 'week', 'month', 'year'
  quantityAvailable: Number
}
```

### RentalOrder
```javascript
{
  productId: ObjectId,
  customerId: ObjectId,
  endUserId: ObjectId,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  startDate: Date,
  endDate: Date,
  duration: Number,
  durationUnit: String, // 'hour', 'day', 'week', 'month', 'year'
  totalPrice: Number,
  depositAmount: Number,
  status: String, // 'quotation', 'confirmed', 'reserved', 'delivered', 'returned', 'late', 'cancelled'
  pickupDate: Date,
  returnDate: Date,
  lateFees: Number,
  paymentStatus: String, // 'pending', 'partial', 'paid', 'refunded'
  deliveryAddress: String,
  notes: String
}
```

### User
```javascript
{
  email: String,
  password: String, // hashed
  name: String,
  role: String, // 'enduser', 'customer'
  phone: String,
  address: String,
  companyName: String, // For end users
  businessType: String // For end users
}
```

### Notification
```javascript
{
  userId: ObjectId,
  type: String, // 'rental_reminder', 'payment_due', 'return_reminder'
  message: String,
  isRead: Boolean,
  scheduledDate: Date,
  relatedOrderId: ObjectId
}
```

## Pages Structure

### Customer Routes
- `/` - Home page with product grid
- `/booking/[id]` - Individual product booking page
- `/my-bookings` - Customer's booking history

### Admin Routes
- `/admin` - Dashboard with KPIs and booking management
- `/admin/products` - Product management (add/edit products)

### Auth Routes
- `/login` - Login page
- `/register` - Registration page

## API Routes
- `GET/POST /api/products` - Product CRUD
- `GET/POST/PATCH /api/bookings` - Booking CRUD
- `GET /api/stats` - Admin dashboard statistics
- `/api/auth/*` - NextAuth routes

## Components

### Customer Components
- `ProductCard` - Product display with booking button
- `BookingForm` - Date selection and price calculation
- `BookingList` - Customer booking history
- `PaymentSimulation` - Fake payment modal

### Admin Components
- `AdminTable` - Booking management table
- `DashboardCharts` - Revenue and rental charts
- `ProductForm` - Add/edit product form
- `KPICards` - Dashboard summary cards

### Shared Components
- `Navbar` - Navigation with auth status
- `Footer` - Site footer
- `LoadingSpinner` - Loading states
- `StatusBadge` - Booking status display

## Simulated/Fake Features
- **Payment Processing**: Razorpay test mode or success modal
- **Availability Calendar**: Hardcoded unavailable dates
- **Notifications**: Static banners for demo
- **Email Sending**: Console logs only
- **Real-time Updates**: Static data refresh

## Development Phases

### Phase 1: Core Setup (Current)
- Project scaffolding
- Database connection
- Basic auth setup
- Winston logging configuration

### Phase 2: Backend APIs
- Product CRUD operations
- Booking system logic
- Statistics aggregation
- Seed data creation

### Phase 3: Customer Frontend
- Product browsing
- Booking flow
- Payment simulation
- My bookings page

### Phase 4: Admin Frontend
- Dashboard with charts
- Booking management
- Product management
- KPI displays

### Phase 5: Polish & Deploy
- Responsive design
- Error handling
- Vercel deployment
- MongoDB Atlas configuration

## Key Design Decisions
1. **Simulate Complex Features**: Focus on UI/UX over backend complexity
2. **Hardcode Demo Data**: Use realistic but static data for charts
3. **Minimal Auth**: Simple email/password without email verification
4. **Static Availability**: Avoid complex scheduling algorithms
5. **Test Payment Only**: No real payment processing needed

## Success Metrics for Demo
- ✅ Complete customer booking flow (browse → book → pay)
- ✅ Admin can view all bookings and basic stats
- ✅ Responsive design works on mobile
- ✅ Professional UI that impresses judges
- ✅ App loads and works without errors

## Environment Variables Needed
```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000
RAZORPAY_KEY_ID=test_key (optional)
```

## Deployment Checklist
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set in Vercel
- [ ] Build succeeds without errors
- [ ] Database seeded with demo data
- [ ] All routes accessible
- [ ] Payment simulation works
