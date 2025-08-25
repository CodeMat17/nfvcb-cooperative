# NFVCB Multipurpose Cooperative Society

A modern, award-winning fintech web application for managing cooperative society operations, built with Next.js 15, TypeScript, Tailwind CSS, and Convex.

## 🚀 Features

### For Members

- **Secure OTP Authentication**: 6-digit PIN verification system
- **Personal Dashboard**: View contributions, loan status, and activity history
- **Quick Loans**: Apply for 6-month duration loans (max ₦500,000)
- **Core Loans**: Apply for 2-year duration loans (max ₦2,000,000)
- **Loan Restrictions**: Smart validation preventing multiple active loans of the same type
- **Activity History**: Complete transaction and loan activity tracking

### For Administrators

- **Member Management**: View, search, and edit all cooperative members
- **Loan Administration**: Approve, reject, and clear loan applications
- **Real-time Dashboard**: Live statistics and activity monitoring
- **User Information Updates**: Modify member details, PINs, and contributions

### Technical Features

- **Modern UI/UX**: Beautiful, responsive design with light/dark mode
- **Real-time Updates**: Live data synchronization with Convex
- **Type Safety**: Full TypeScript implementation with no 'any' types
- **Animations**: Smooth Framer Motion animations throughout
- **Accessibility**: WCAG compliant components and interactions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.0, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Backend**: Convex (serverless database and functions)
- **Animations**: Framer Motion
- **Date Handling**: Day.js
- **Theming**: next-themes (light/dark mode)
- **Notifications**: Sonner toast notifications

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nfvcb-cooperative
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will create a new Convex project and provide you with the deployment URL.

4. **Configure environment variables**
   Create a `.env.local` file:

   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

5. **Seed the database** (optional)
   After setting up Convex, you can seed the database with sample data by calling the seed function in the Convex dashboard or through the API.

6. **Run the development server**
   ```bash
   yarn dev
   ```

## 🎯 Usage

### For Members

1. Visit the homepage and enter your 6-digit PIN
2. View your personal dashboard with contributions and loan status
3. Apply for Quick or Core loans based on eligibility
4. Monitor loan applications and activity history

### For Administrators

1. Navigate to `/admin` to access the administrative dashboard
2. View all cooperative members and their information
3. Manage loan applications (approve/reject/clear)
4. Update member information as needed

## 📊 Database Schema

### Users Table

- `name`: Full name of the member
- `dateJoined`: Date when member joined the cooperative
- `ippis`: IPPIS number
- `pin`: 6-digit authentication PIN
- `monthlyContributions`: Monthly contribution amount
- `totalContributions`: Total contributions to date

### Quick Loans Table

- `userId`: Reference to user
- `amount`: Loan amount requested
- `status`: processing/approved/rejected/cleared
- `dateApplied`: Application date
- `dateApproved`: Approval date (optional)
- `expiryDate`: Loan expiry date (6 months from approval)
- `clearedDate`: Date when loan was cleared (optional)

### Core Loans Table

- Similar structure to Quick Loans but with 2-year duration

### Activity History Table

- Tracks all loan-related activities and status changes

## 🔧 Development

### Project Structure

```
nfvcb-cooperative/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── otp-input.tsx     # OTP verification component
│   ├── user-dashboard.tsx # Member dashboard
│   └── ...
├── convex/               # Convex backend
│   ├── schema.ts         # Database schema
│   ├── users.ts          # User management functions
│   ├── loans.ts          # Loan management functions
│   └── ...
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── ...
```

### Key Components

- **OTPInput**: Elegant 6-digit PIN input with animations
- **UserDashboard**: Member dashboard with loan applications
- **AdminDashboard**: Administrative interface with tabs
- **LoanApplicationDialog**: Modal for loan applications
- **UserEditDialog**: Admin tool for editing member information

## 🎨 Design System

The application uses a comprehensive design system with:

- **Color Palette**: Blue and purple gradients with semantic colors
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable shadcn/ui components
- **Animations**: Smooth Framer Motion transitions

## 🔒 Security Features

- **PIN Authentication**: Secure 6-digit PIN verification
- **Loan Validation**: Prevents multiple active loans of the same type
- **Input Validation**: Comprehensive form validation
- **Type Safety**: Full TypeScript coverage

## 🚀 Deployment

1. **Deploy to Vercel**

   ```bash
   yarn build
   vercel --prod
   ```

2. **Deploy Convex**

   ```bash
   npx convex deploy
   ```

3. **Set production environment variables**
   - `NEXT_PUBLIC_CONVEX_URL`: Production Convex deployment URL

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎯 Performance

- **Optimized Images**: Next.js Image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Efficient caching strategies
- **Bundle Size**: Optimized bundle with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for NFVCB Multipurpose Cooperative Society**
