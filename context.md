ROLE

You are an expert Senior Full Stack Engineer.

Build a production-quality MVP for a hackathon.

Primary goal:

Finish ALL mandatory features within 5 hours.

Do NOT over-engineer.

Prefer working software over perfect architecture.

TECH STACK

Frontend

Next.js 15 App Router
TypeScript
TailwindCSS
shadcn/ui
React Hook Form
TanStack Table
Zustand
Recharts

Backend

Next.js Server Actions
Route Handlers
Prisma ORM
MySQL

Authentication

Auth.js Credentials
bcrypt
JWT Session

Validation

Zod

Deployment Ready

Vercel
Neon/Supabase
UI

Use the uploaded wireframe as the reference.

Follow its layout closely.

Requirements

clean
responsive
modern
minimal
dashboard style

Color palette

Primary

#F59E0B

Dark

#111827

Gray

#F3F4F6

Radius

12px

Cards

soft shadow
AUTH

Implement

Login

Logout

Protected Routes

RBAC

Roles

Fleet Manager

Dispatcher

Safety Officer

Financial Analyst

Unauthorized users cannot access protected pages.

Passwords

bcrypt hashed

Session

JWT

Middleware protection.

DATABASE

Create Prisma schema.

Entities

Users

Roles

Vehicles

Drivers

Trips

MaintenanceLogs

FuelLogs

Expenses

Relations must be normalized.

Use indexes.

Use foreign keys.

Registration Number must be UNIQUE.

License Number UNIQUE.

Email UNIQUE.

VEHICLE

Fields

Registration Number

Model

Vehicle Type

Max Capacity

Odometer

Acquisition Cost

Status

Status Enum

Available

On Trip

In Shop

Retired

Validation

Capacity > 0

Odometer >=0

Unique Registration

Retired vehicles immutable except viewing.

DRIVER

Fields

Name

License Number

Category

Expiry Date

Phone

Safety Score

Status

Validation

Expiry > Today

Phone valid

Score 0-100

Status

Available

On Trip

Off Duty

Suspended

Expired License

Cannot Dispatch

TRIPS

Fields

Source

Destination

Vehicle

Driver

Cargo Weight

Distance

Status

Trip Status

Draft

Dispatched

Completed

Cancelled

Validation

Vehicle Available

Driver Available

License Valid

Not Suspended

Cargo <= Capacity

Vehicle not retired

Vehicle not In Shop

Vehicle not already On Trip

Driver not already On Trip

Automatic transitions

Dispatch

Vehicle -> On Trip

Driver -> On Trip

Complete

Vehicle -> Available

Driver -> Available

Cancel

Vehicle -> Available

Driver -> Available

MAINTENANCE

Fields

Vehicle

Type

Description

Cost

Status

Open

Closed

Business Rules

Open

Vehicle -> In Shop

Hide from dispatch

Close

Vehicle -> Available

Unless Retired

FUEL

Fields

Vehicle

Date

Fuel

Cost

Distance

Auto compute

Fuel Efficiency

Distance/Fuel

EXPENSE

Fields

Vehicle

Type

Amount

Date

Description

Categories

Fuel

Maintenance

Toll

Other

Operational Cost

Fuel

Maintenance

Expenses

DASHBOARD

KPIs

Active Vehicles

Available Vehicles

Maintenance Vehicles

Active Trips

Pending Trips

Drivers On Duty

Fleet Utilization %

Cards

Recent Trips Table

Vehicle Status Chart

Filters

Vehicle Type

Region

Status

ANALYTICS

Metrics

Fuel Efficiency

Fleet Utilization

Operational Cost

Vehicle ROI

Formula

Revenue

Maintenance

Fuel

/

Acquisition Cost

Charts

Bar

Line

Pie

CSV Export

TABLES

Every table must support

Search

Sorting

Pagination

Filters

Responsive

Sticky Header

FORMS

React Hook Form

Zod

Inline Errors

Disable submit while loading

Toast notifications

Optimistic UI where safe

VALIDATIONS

Vehicle Registration unique

Driver License unique

Phone valid

Email valid

Weight <= Capacity

License not expired

Driver Available

Vehicle Available

Vehicle not In Shop

Vehicle not Retired

Driver not Suspended

Distance >0

Fuel >0

Cost >=0

Acquisition Cost >0

Prevent duplicate dispatch.

All validations must exist

Client

AND

Server.

SECURITY

Sanitize inputs

Server-side validation

Role authorization

Parameterized queries via Prisma

Never trust frontend

Prevent unauthorized API access

No secrets on client

PERFORMANCE

Server Components whenever possible

Lazy load charts

Memoize expensive tables

Pagination

Indexed DB columns

Minimize rerenders

Use server actions

Avoid unnecessary client components

ERROR HANDLING

Centralized error helper

Friendly toast

Meaningful messages

No crashes

Graceful fallback

CODE STYLE

Feature-based folders

Reusable components

Strong typing

No duplicated code

Small functions

Comments only where necessary

SEED

Create demo data

Admin

Fleet Manager

Dispatcher

Safety Officer

Financial Analyst

10 Vehicles

15 Drivers

20 Trips

Maintenance

Fuel Logs

Expenses

Dashboard should look populated immediately.

BONUS

Dark Mode

Charts

CSV Export

Email Reminder stub

Document Upload placeholder

DELIVERABLE

Generate in this exact order:

Project structure
Prisma schema
Authentication
Middleware
Seed
Database helpers
Validation schemas
Feature modules
Dashboard
Analytics
Export
Final polishing

Do NOT stop until every mandatory requirement is completed.

Always prioritize working functionality over abstraction.

Avoid unnecessary explanations.

Generate production-ready code only.