# XRT Rough Touch Football League

A full-featured rough touch football league management web application built with Next.js, Firebase, Tailwind CSS, and Framer Motion.

## Features

- **Authentication** — Email/password login & signup with role-based access (user, admin, executive)
- **Dashboard** — League overview, standings, recent games, top players, notifications
- **Teams** — Browse teams, view rosters, win/loss records
- **Players** — Player profiles, full stats, search/filter, leaderboards
- **Games** — Season schedule, live scores, results grouped by week
- **Playoffs** — Visual bracket system with round progression
- **Championship** — Animated trophy, winner & MVP showcase, highlight media
- **MVP Voting** — Fan voting system with live tallies
- **Notifications** — Real-time notification feed
- **Admin Dashboard** — Full CRUD for teams, players, games, playoffs, championship
- **Activity Log** — Tracks all admin actions
- **Dark Mode** — Toggle between light and dark themes
- **Real-time Updates** — Firestore listeners for live data

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Firebase** (Auth, Firestore, Storage)
- **Lucide React** (Icons)

## Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **test mode** (you'll deploy proper rules later)
3. Choose a location closest to your users

### 4. Enable Storage

1. Go to **Storage** > **Get started**
2. Start in test mode

### 5. Register a Web App

1. Go to **Project Settings** > **General**
2. Under "Your apps", click the web icon (`</>`)
3. Register your app and copy the Firebase config

### 6. Set Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Firebase config values from step 5

### 7. Deploy Security Rules

Install Firebase CLI and deploy rules:
```bash
npm install -g firebase-tools
firebase login
firebase init  # Select Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

### 8. Set Up an Admin User

After creating an account through the app, manually set the role in Firestore:

1. Go to **Firestore** > **users** collection
2. Find your user document
3. Change the `role` field from `"user"` to `"executive"`

## Installation

```bash
# Clone and enter the project
cd xrt-football-league

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - XRT Rough Touch Football League"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/xrt-football-league.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Add all environment variables from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**

### 3. Update Firebase Auth Domain

After deploying, add your Vercel domain to Firebase:
1. Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Add your `*.vercel.app` domain

## Role System

| Role | Permissions |
|------|------------|
| `user` | View all data, vote for MVP |
| `admin` | All user permissions + manage teams, players, games, playoffs |
| `executive` | All admin permissions + manage championship, manage user roles |

## Project Structure

```
xrt-football-league/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Login & Signup
│   ├── dashboard/          # Main dashboard
│   ├── teams/              # Teams list & detail
│   ├── players/            # Players list & detail
│   ├── games/              # Game schedule & results
│   ├── playoffs/           # Playoff bracket
│   ├── championship/       # Championship page
│   ├── mvp-voting/         # MVP voting
│   ├── notifications/      # Notifications feed
│   └── admin/              # Admin panel (protected)
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── lib/                    # Firebase config & utilities
├── types/                  # TypeScript types
└── public/                 # Static assets
```
