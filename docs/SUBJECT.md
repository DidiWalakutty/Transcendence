# ft_transcendence

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Team Roles & Management](#2-team-roles--management)
3. [Mandatory & Technical Requirements](#3-mandatory--technical-requirements)
4. [The Modules System (14 Points Required)](#4-the-modules-system-14-points-required)
   - [Web](#web)
   - [Accessibility & Internationalization](#accessibility--internationalization)
   - [User Management](#user-management)
   - [Artificial Intelligence](#artificial-intelligence)
   - [Cybersecurity](#cybersecurity)
   - [Gaming & User Experience](#gaming--user-experience)
   - [DevOps](#devops)
   - [Data & Analytics](#data--analytics)
   - [Blockchain](#blockchain)
   - [Modules of Choice](#modules-of-choice)
5. [README.md Requirements](#5-readmemd-requirements)
6. [Bonus Part](#6-bonus-part)
7. [Submission & Evaluation Notes](#7-submission--evaluation-notes)

---

## 1. Project Overview

- **Goal:** Create a real-world multi-user web application as a team.
- **Team Size:** Group project of 4–5 people.
- **Core Task:** Complete a baseline mandatory core + select customized modules to earn a minimum of **14 points**.
- **AI Rule:** AI tools can be used to assist with repetitive tasks, but you must completely understand, test, and be ready to explain any AI-generated code. Copy-pasting code you cannot explain results in immediate project failure.

---

## 2. Team Roles & Management

Teams must assign the following roles (one person can hold multiple roles if the team has 4 members):

- **Product Owner (PO):** Defines product vision, prioritizes features, maintains the product backlog, and validates completed work.
- **Project Manager (PM) / Scrum Master:** Facilitates coordination, runs meetings, tracks deadlines, and removes blockers.
- **Technical Lead / Architect:** Oversees architecture design, technology stack decisions, code quality, and reviews critical changes.
- **Developers (All Members):** Implement modules, write tests, participate in code reviews, and document work.

_Note: Role distribution, coordination tools (e.g., Jira, Trello, GitHub Issues), and communication choices (e.g., Discord, Slack) must be documented in the README and explained during peer evaluation._

---

## 3. Mandatory & Technical Requirements

Failing any of these core baselines results in **immediate project rejection**:

### General Requirements

- **Architecture:** Must be a web application containing a frontend, a backend, and a database.
- **Multi-user Support:** Must cleanly support multiple concurrent logged-in users interacting simultaneously without data corruption or performance issues.
- **Deployment:** Must use containerization (Docker, Podman, or equivalent) and launch cleanly via a **single command**.
- **Browser Compatibility:** Optimized for the latest stable version of Google Chrome with **zero warnings/errors** in the browser console.
- **Legal/Compliance Pages:** Accessible, non-placeholder **Privacy Policy** and **Terms of Service** pages (commonly linked in the footer) are strictly required.
- **Git Practices:** Meaningful commit history representing balanced contributions from all team members.

### Technical Requirements

- **Frontend:** Responsive layout using a CSS framework/solution (e.g., Tailwind, Bootstrap, Material-UI).
- **Security & Auth:**
  - Basic sign-up and login with encrypted credentials (properly hashed and salted passwords).
  - Inputs and forms must be validated on **both** frontend and backend.
  - All connections from the browser/externally to the backend must enforce **HTTPS**. (Internal container-to-container traffic can be unencrypted).
- **Secrets:** Critical keys and variables must reside in a local `.env` file ignored by Git. An `.env.example` file must be provided.
- **Database:** Must utilize a clear schema with well-defined relations.

---

## 4. The Modules System (14 Points Required)

To pass, your team must select and implement a combination of modules worth at least **14 points** (Major = 2 pts, Minor = 1 pt).

_Important Dependency Rule:_ Gaming or tracking modules (AI Opponent, Tournament, Match History, Customization, Spectator Mode, 3+ Multiplayer, Adding a 2nd Game) require that a functional baseline game is implemented first. Advanced chat features require the basic chat module.

### Web

- **Major (2 pts):** Full Framework implementation — Use a backend framework (Express, Django, NestJS, etc.) AND a frontend framework (React, Vue, Svelte, Angular). _Full-stack frameworks like Next.js/Nuxt.js count for both if both capabilities are utilized._
- **Minor (1 pt):** Use a Frontend framework only.
- **Minor (1 pt):** Use a Backend framework only.
- **Major (2 pts):** Real-time features using WebSockets (graceful disconnects, broadcasting).
- **Major (2 pts):** User Interaction System (Basic chat, profile views, and a friends list system).
- **Major (2 pts):** Secure Public API (Minimum 5 endpoints: GET, POST, PUT, DELETE with rate limiting, documentation, and API key security).
- **Minor (1 pt):** Database integration via an ORM.
- **Minor (1 pt):** Complete Notification System across all CRUD operations.
- **Minor (1 pt):** Real-time collaborative features (live drawing, shared workspace).
- **Minor (1 pt):** Server-Side Rendering (SSR) for performance/SEO.
- **Minor (1 pt):** Progressive Web App (PWA) with offline capabilities.
- **Minor (1 pt):** Custom design system (min. 10 reusable UI components with cohesive typography/palette).
- **Minor (1 pt):** Advanced search functionality with filtering, sorting, and pagination.
- **Minor (1 pt):** Secure file upload and management (client/server validation, preview options, file deletions).

### Accessibility & Internationalization

- **Major (2 pts):** Full WCAG 2.1 AA accessibility compliance (screen readers, keyboard navigation).
- **Minor (1 pt):** Multi-language support (at least 3 complete language translations with an in-app toggle).
- **Minor (1 pt):** Right-to-Left (RTL) language support (full UI mirroring layout adjustment, e.g., Arabic/Hebrew).
- **Minor (1 pt):** Extended multi-browser support (fully cross-compatible with at least 2 extra browsers like Firefox, Safari, or Edge).

### User Management

- **Major (2 pts):** Standard user profiles (avatar uploads, profile pages, online/offline friend tracking).
- **Minor (1 pt):** Game statistics & match history leaderboard (requires game implementation).
- **Minor (1 pt):** Remote third-party authentication via OAuth 2.0 (Google, GitHub, 42, etc.).
- **Major (2 pts):** Advanced CRUD permissions and Role Management (Admin, Moderator, User, Guest).
- **Major (2 pts):** Organization/Tenant management system (Create/edit organizations, assign members, role actions inside orgs).
- **Minor (1 pt):** Secure Two-Factor Authentication (2FA) system.
- **Minor (1 pt):** User activity analytics and insights dashboard.

### Artificial Intelligence

- **Major (2 pts):** AI Opponent for your game (must simulate human-like play instead of perfect execution, win occasionally, and support custom game modes).
- **Major (2 pts):** Full RAG (Retrieval-Augmented Generation) system utilizing a large dataset.
- **Major (2 pts):** Streaming LLM interface generating text/images with error handling and rate limits.
- **Major (2 pts):** Machine learning recommendation system (collaborative/content-based filtering).
- **Minor (1 pt):** AI content moderation (automated flags, warnings, or text deletions).
- **Minor (1 pt):** Voice/speech-to-text integration.
- **Minor (1 pt):** Sentiment analysis on user-generated text blocks.
- **Minor (1 pt):** Image recognition and auto-tagging system.

### Cybersecurity

- **Major (2 pts):** Hardened Web Application Firewall (WAF/ModSecurity) configuration paired with HashiCorp Vault for credential/secret isolation.

### Gaming & User Experience

- **Major (2 pts):** Complete web-based live multiplayer game with clear rules and win conditions (e.g., Pong, Chess, Tic-Tac-Toe, Cards). Can be 2D or 3D.
- **Major (2 pts):** Remote live gameplay capabilities across different computers (handling network latency and reconnection loops smoothly).
- **Major (2 pts):** Multiplayer gameplay expansions supporting 3 or more simultaneous players.
- **Major (2 pts):** Distinct second game option complete with dedicated user history and automated matchmaking.
- **Major (2 pts):** Advanced 3D environments and rendering using Three.js, Babylon.js, or similar.
- **Minor (1 pt):** Advanced chat features (blocking users, direct match invites from chat, typing indicators, read receipts, persistent history).
- **Minor (1 pt):** Structured Tournament Bracket system (registration management, matchmaking order).
- **Minor (1 pt):** Game customizations (power-ups, special abilities, unique maps/themes).
- **Minor (1 pt):** Persistent Gamification rewards system (tracking at least 3: achievements, badges, XP/levels, daily challenges).
- **Minor (1 pt):** Real-time spectator mode (watching ongoing live matches with optional spectator chat).

### DevOps

- **Major (2 pts):** Log Management Infrastructure utilizing an ELK Stack (Elasticsearch, Logstash, Kibana) with access control and archival policies.
- **Major (2 pts):** Full system monitoring using Prometheus and Grafana (custom dashboards, alerting pipelines, metrics exporters).
- **Major (2 pts):** Loosely-coupled Microservices architecture for backend services communicating via REST or message queues.
- **Minor (1 pt):** Health-check systems, automated backup procedures, and documented disaster recovery protocols.

### Data & Analytics

- **Major (2 pts):** Advanced analytics dashboard visualizing interactive charts (line, bar, pie) with real-time sync, customizable date toggles, and data export pipelines.
- **Minor (1 pt):** Bulk data export/import validation workflows (JSON, CSV, XML).
- **Minor (1 pt):** GDPR Compliance features (User-requested raw data extraction, explicit account/data deletion, confirmation emails).

### Blockchain

- **Major (2 pts):** Immutable scoreboard tracking via Avalanche and Solidity smart contracts running on a test blockchain network.
- **Minor (1 pt):** Decentralized backend running on Internet Computer Protocol (ICP). _Note: Incompatible with SSR._

### Modules of Choice

- **Major (2 pts) / Minor (1 pt):** Implement an unlisted custom feature. Requires technical complexity and thorough justification in the README detailing the challenge, value added, and points validation.

---

## 5. README.md Requirements

Your repository must contain a comprehensive, professional `README.md` file written in English.

### Formatting & Exact Text Requirements

- **Line 1 (Mandatory Italic text):** _This project has been created as part of the 42 curriculum by <login1>[, <login2>[, <login3>[...]]]._

### Required Sections

1. **Description:** Project name, core objectives, and an overview of key functionalities.
2. **Team Information:** Detailed list of members, assigned roles (PO, PM, Tech Lead, Devs), and exact individual responsibilities.
3. **Project Management:** Overview of task organization workflows, meetups, scheduling, PM tools used (Trello, GitHub Issues, etc.), and communication channels.
4. **Technical Stack:** Justification of core frameworks and choices across the Frontend, Backend, and Database tiers.
5. **Database Schema:** Visual description or relational diagram mapping out database structure, field types, and keys.
6. **Features List:** Comprehensive inventory of all built functionalities specifying which teammate authored them.
7. **Modules Matrix:** Table of chosen Major/Minor modules, point calculations summing up to at least 14 points, implementation breakdowns, and developer assignments.
8. **Individual Contributions:** Transparent evaluation detailing what each member added, roadblocks encountered, and how they were resolved.
9. **Instructions:** Setup prerequisites, environment profile configurations (`.env`), and exact step-by-step startup commands.
10. **Resources:** References utilized (tutorials, articles, docs) along with an explicit disclosure of how, where, and for what tasks AI was leveraged.

---

## 6. Bonus Part

- Bonuses are only calculated if your team successfully validates all selected baseline modules hitting the **14-point threshold**.
- Any fully operational, valuable extra module listed in the subjects can count as a bonus.
- **Max bonus points:** 5 points total (e.g., 5 minors, or 2 majors + 1 minor).

---

## 7. Submission & Evaluation Notes

- Evaluation relies strictly on the code present inside your remote Git repository.
- **Live Modification Challenge:** During the peer defense, evaluators may ask the team to perform a quick live modification of the project (e.g., adding a minor layout adjustment, writing/changing a few lines of code, altering a data rule). This is used to instantly confirm whether the team fully understands their codebase.
