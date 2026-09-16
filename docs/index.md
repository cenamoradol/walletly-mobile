---
layout: default
title: Walletly — Privacy Policy
---

# Privacy Policy — Walletly

Last updated: September 14, 2026

Walletly ("the app") is a personal finance management application. This policy explains what data we collect, how we use it, and who we share it with.

## Data we collect

**Account data:**
- Email address
- Password (stored as a cryptographic hash, never in plain text)
- First name, last name (optional)
- Phone number (optional)
- Preferred currency

**Financial data:**
- Transactions you create (amount, date, category, payment method, description, location)
- Payment methods you register (name, type, balance)
- Budgets you define
- Categories you create

**Usage data:**
- Authentication tokens (kept on your device)
- SMS text content, only if you explicitly use the AI auto-parse feature

## How we use your data

- To provide the core finance-tracking functionality of the app
- To sync your data across your devices via our backend
- If you use the AI SMS parser: the SMS text you submit is sent to OpenAI to extract transaction details. The text is processed but not stored by OpenAI beyond the request. You can disable this feature at any time.
- We do not sell your data. We do not show you ads.

## Third-party services

| Service | Purpose | Data shared |
|---|---|---|
| **Supabase** | Database and authentication backend | All your account and financial data |
| **OpenAI** | SMS transaction auto-parsing (optional feature) | Only the SMS text you submit to the parser |
| **RevenueCat** | In-app purchase management (future use) | Purchase receipts and subscription status only; not active in current version |
| **Render** | Backend hosting | Hosts the API; sees HTTPS traffic but no plain-text content |

Each provider has its own privacy policy:
- Supabase: https://supabase.com/privacy
- OpenAI: https://openai.com/policies/privacy-policy
- RevenueCat: https://revenuecat.com/privacy
- Render: https://render.com/privacy

## Data storage and security

- Data is stored encrypted in transit (HTTPS/TLS) and at rest (managed by Supabase).
- Authentication uses JWT tokens with 7-day expiration.
- Passwords are hashed with bcrypt (cost factor 10).
- We do not have access to your raw password.

## Your rights

- **Access**: you can view all your data inside the app
- **Export**: contact us to receive an export of your data
- **Delete**: you can delete your account at any time from the app settings; this removes your data from our servers
- **Correction**: you can update your profile information inside the app

## Children

Walletly is not intended for children under 13. We do not knowingly collect data from children under 13.

## Changes to this policy

We may update this policy. Changes will be posted on this page with an updated "Last updated" date.

## Contact

Questions, requests, or complaints: **support@cenamoradol.dev**

---

This app is provided by an individual developer. For App Store compliance, this document is hosted at a public URL.
