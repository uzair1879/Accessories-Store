<div align="center">

# 🛍️ Accessories Store

**A minimal, iOS-inspired e-commerce store for gadgets — earbuds, laptops, iPhones, and accessories — built as a single-file frontend with a real SQLite backend.**

Delivered across Pakistan 🇵🇰 · Cash on Delivery & Jazz Cash accepted

[![Made with](https://img.shields.io/badge/made%20with-HTML%20%2B%20Node.js-black?style=flat-square)](#)
[![Database](https://img.shields.io/badge/database-SQLite-blue?style=flat-square)](#)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)

</div>

---

## ✨ About

**Accessories Store** is a fully functional online store designed with an **ultra-minimal, Apple-inspired UI**. Everything — the storefront, the shopping cart, the checkout flow, and the admin dashboard — lives inside **one single `index.html` file**, backed by a lightweight **Node.js + SQLite** server that persists products, orders, and analytics.

Perfect for learning full-stack development, prototyping an e-commerce idea, or running a small dropshipping business locally.

---

## 🚀 Features

### 🛒 Storefront
- Ultra-minimal iOS-style design
- Product grid with categories and filters
- Product detail pages with related items
- Live cart counter and slide-in bag
- Fully responsive (mobile, tablet, desktop)

### 💳 Checkout
- Pakistani phone number validation
- Address & city capture
- 🇵🇰 **Jazz Cash** with QR code (demo) or **Cash on Delivery**
- Automatic delivery date estimation
- Order confirmation screen with full details

### 🔐 Hidden Admin Panel
- Accessible only via a **secret code** in the footer email box
- Passcode-protected login with lockout after failed attempts
- **Dashboard** — revenue, orders, units sold, avg order value, live activity feed
- **Orders** — view, update status, adjust delivery days, delete
- **Products** — publish, edit, delete with image URL, stock, price
- **Settings** — store name, delivery defaults, Jazz Cash details, passcode

### 🗄️ Real Database
- All data stored in **SQLite** (`store.db`)
- Survives browser clears, restarts, and other devices on your network
- Backup = just copy one file
- Auto-seeds 8 demo products on first run

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (single file) |
| Backend | Node.js + Express |
| Database | SQLite (via `better-sqlite3`) |
| Styling | Custom CSS, iOS-inspired design system |
| Fonts | System font stack (SF Pro on Apple devices) |

**No frameworks. No build step. No dependencies on the frontend.**

---

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org) v18 or newer (v22+ recommended)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/uzairarslan/accessories-store.git
   cd accessories-store