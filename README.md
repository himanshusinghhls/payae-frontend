<div align="center">
  
# 🏦 PayAE
**Automated Wealth & UPI Micro-Investing Platform**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> PayAE is a full-stack fintech platform that intercepts secure UPI payments, mathematically calculates fractional spare change, and automatically routes those funds into diversified asset portfolios like Digital Gold and Mutual Funds.

**[🚀 Live](https://payae.vercel.app) | [🖥️ View Frontend Repository](https://github.com/himanshusinghhls/payae-frontend) | [⚙️ View Backend Repository](https://github.com/himanshusinghhls/payae-backend)**

</div>

---

# ⚡ Overview

PayAE removes the friction from investing by turning everyday spending into automated wealth generation.

By utilizing a **Smart Round-Up algorithm**, the platform categorizes variable transaction tiers and instantly diverts spare change into a secure, real-time ledger system.

It combines **enterprise-grade financial security** with a highly interactive, 3D-visualized user interface.

---

# ✨ Key Architectural Features

## 💰 Dynamic Smart Round-Ups
An algorithmic engine that calculates variable round-up thresholds based on the size of the UPI transaction, maximizing micro-investments without impacting user cash flow.

---

## 📊 High-Integrity Ledger System
Engineered with **real-time mathematical deduplication** to ensure absolute accuracy during asset liquidation and fractional share purchasing.

---

## 🔐 Enterprise-Grade Security
Features:

- JWT Authentication  
- Account-isolated PIN caching  
- Automated high-value transaction alerting via Brevo SMTP API  

---

## 🧭 Spatial FinTech UI
A premium frontend featuring:

- Integrated QR code scanning  
- Glassmorphic UI aesthetics  
- Physics-based 3D portfolio visualizations  

---

# 🏗️ System Architecture & Tech Stack

The application is built on a **decoupled microservice architecture** separated into two repositories.

---

## Frontend (Client)

**Framework**
- React.js

**State Management**
- React Query

**Styling**
- Tailwind CSS  
- Glassmorphism UI  

**Animation & Visuals**
- Framer Motion (3D physics-based visualizations)

**Features**
- Integrated QR Code Scanner  
- Live Portfolio Dashboard  

---

## Backend (Core Engine)

**Framework**
- Spring Boot (Java)

**Database & ORM**
- PostgreSQL / MySQL  
- Hibernate (JPA)

**Payment Gateway**
- Razorpay API Integration

**Security**
- JWT (JSON Web Tokens)  
- Spring Security  
- Isolated PIN Caching  

**Communications**
- Brevo SMTP API for transactional email alerts

---

# 🚀 Getting Started

---

# 1️⃣ Running the Backend (Spring Boot)

Ensure you have **Java 17+** and **Maven** installed.

```bash
# Clone the backend repository
git clone https://github.com/himanshusinghhls/payae-backend.git
cd payae-backend
```

Configure your `application.properties` file:

- Database credentials  
- Razorpay API keys  
- Brevo SMTP credentials  

Then run the backend:

```bash
mvn clean install
mvn spring-boot:run
```

The API will run at:

```
http://localhost:8080
```

---

# 2️⃣ Running the Frontend (React)

Ensure you have **Node.js 18+** installed.

```bash
# Clone the frontend repository
git clone https://github.com/himanshusinghhls/payae-frontend.git
cd payae-frontend
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```
REACT_APP_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm start
```

The frontend will run at:

```
http://localhost:3000
```

---

# 🔐 Security & Compliance Note

This repository contains the foundational architecture for the **PayAE platform**.

Sensitive data such as:

- API keys  
- Database credentials  
- Payment gateway secrets  

have been excluded using:

- `.gitignore`
- environment variables

This follows **secure financial software development best practices**.

---

<div align="center">

Engineered and Designed by **Himanshu Singh**

</div>
