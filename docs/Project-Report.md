# Project Report

## 1. Overview

This project is a React and Express event-management platform backed by MongoDB/Mongoose.

## 2. Objectives and Features

The system supports authentication, three-role RBAC, event CRUD, organizer ownership, participant registration/cancellation, duplicate prevention, search/filtering, organizer/admin dashboards, user management, feedback, and responsive UI.

## 3. Architecture

The React frontend communicates with an Express API. Mongoose models persist users, events, registrations, and feedback. JWTs carry the authenticated user ID and role.

## 4. Roles

ADMIN manages users and global event/registration data. ORGANIZER manages owned events and their registrations. PARTICIPANT browses events and manages personal registrations.

## 5. Database and API

See [Database-Schema.md](Database-Schema.md), [ER-Diagram.md](ER-Diagram.md), and [API-Documentation.md](API-Documentation.md). Event ownership uses `organizerId`; registrations use a unique `userId`/`eventId` index.

## 6. Event and Registration Flow

Organizers create events; participants register through authenticated endpoints. Capacity, deadline, role, duplicate, and ownership checks are enforced on the backend.

## 7. Search, Dashboards, and Responsive Design

Event search/filtering is performed in the listing UI. Organizer and admin dashboards query scoped backend data. Shared and page-specific CSS provides desktop, tablet, and mobile layouts.

## 8. Deployment

The backend is prepared for Render/Railway and MongoDB Atlas; the frontend is prepared for Vercel. See the root README for environment variables and deployment setup.

## 9. Notes and Future Improvements

The legacy `Event.bookedBy` list remains synchronized with the newer Registration collection. Future work could migrate fully to Registration records, add pagination, automated status transitions, and richer registration reporting.

## 10. Conclusion

The repository provides a maintainable full-stack foundation for role-aware event creation, discovery, and participation.
