# RAJ INSTITUTE OF MEDICAL SCIENCES — Full Stack Website

A complete medical institute website built with **React + Vite + Appwrite**.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Appwrite

Create a free project at [https://cloud.appwrite.io](https://cloud.appwrite.io)

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Appwrite Setup (Required)

#### A. Create a Database
- Go to **Databases** → Create Database
- Copy the Database ID into `VITE_APPWRITE_DATABASE_ID`

#### B. Create Collections

**blood_requests** collection:
| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| name | String (255) | Yes | — |
| address | String (1000) | Yes | — |
| phone | String (20) | Yes | — |
| status | String (20) | Yes | `pending` |
| package | String (255) | No | — |

**packages** collection:
| Attribute | Type | Required |
|-----------|------|----------|
| title | String (255) | Yes |
| description | String (2000) | No |
| price | String (50) | No |
| features | String (2000) | No |
| imageId | String (255) | No |

**feedback** collection:
| Attribute | Type | Required |
|-----------|------|----------|
| name | String (255) | Yes |
| message | String (2000) | Yes |
| rating | Integer | Yes |

#### C. Set Collection Permissions
- **blood_requests**: Create — `Any` | Read/Update/Delete — `Users` (admins)
- **packages**: Create/Read/Delete — configure for admin only
- **feedback**: Create/Read — `Any` | Delete — `Users` (admins)

**Recommended for public read access:**
In each collection settings → Permissions → Add `Any` role with `read` permission for `packages` and `feedback`.
For `blood_requests`, only grant `create` to `Any` (no read — customers can't see each other's data).

#### D. Create Storage Bucket
- Go to **Storage** → Create Bucket: `package_images`
- Copy bucket ID → `VITE_APPWRITE_BUCKET_ID`
- Permissions: Create for Users (admin), Read for Any

#### E. Create Admin Account
- Go to **Auth** → Create User
- Use email: `pankajosank1994@gmail.com`
- Set a secure password
- Use these credentials to log into `/admin`

---

### 4. EmailJS Setup (Optional — for email notifications)

1. Create account at [https://www.emailjs.com](https://www.emailjs.com)
2. Add an email service (Gmail recommended)
3. Create an email template with variables:
   - `{{patient_name}}`, `{{patient_phone}}`, `{{patient_address}}`, `{{status}}`
4. Fill in `.env` with your Service ID, Template ID, and Public Key

---

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Admin Panel

Navigate to `/admin` and log in with your Appwrite user credentials.

---

## 📁 Project Structure

```
src/
├── appwrite.js          # All Appwrite service functions
├── App.jsx              # Router
├── main.jsx             # Entry point
├── index.css            # Global styles
└── components/
    ├── Home.jsx         # Assembles all sections
    ├── Navbar.jsx
    ├── Hero.jsx
    ├── BloodTest.jsx    # Booking form + modal
    ├── Packages.jsx     # Dynamic packages
    ├── Courses.jsx      # Paramedical, Computer, UGC courses
    ├── Gallery.jsx      # Scroll animation gallery
    ├── Feedback.jsx     # Feedback + star rating
    ├── Contact.jsx      # Contact info + hours
    ├── Footer.jsx       # Social links + copyright
    ├── AdminLogin.jsx   # Admin auth
    └── AdminDashboard.jsx # Full admin panel
```

---

## 🌐 Routes

| Route | Description |
|-------|-------------|
| `/` | Public website |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin dashboard (protected) |

---

## 🛡️ Security Notes

- Customers cannot read other customers' blood request data (Appwrite permissions)
- Admin dashboard requires Appwrite authentication
- Packages and feedback are publicly readable
- Blood requests are only created by public, managed by admin

---

## 🏗️ Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.)

---

**Developed by DKS** | © 2024 Raj Institute of Medical Sciences

---

## 🎓 Certificate Section Setup

### Appwrite Collection: `certificates`

| Attribute | Type | Required |
|-----------|------|----------|
| enrollmentNo | String (100) | Yes |
| studentName | String (255) | Yes |
| studentPhone | String (20) | Yes |
| fileId | String (255) | Yes |
| issuedDate | String (50) | No |

**Permissions:** Create — `Users` (admin only) | Read — `Any` | Delete — `Users` (admin only)

> ⚠ Students cannot read other students' data — they only download their own PDF by matching enrollment number.

### Appwrite Storage Bucket: `certificates`

- Create a new bucket named `certificates`
- Permissions: Upload — `Users` (admin), Read — `Any` (for download), Delete — `Users` (admin)
- Allowed file extensions: `pdf`
- Max file size: 10MB

### How It Works

**Admin workflow:**
1. Go to Admin Dashboard → Certificates tab
2. Enter Enrollment No. + Student Name + Student Phone (stored as proof, never shown to student)
3. Upload the PDF certificate file
4. Click Upload Certificate

**Student workflow:**
1. Visit website → Certificate section
2. Click "Get Certificate" 
3. Solve the math CAPTCHA (3 attempts, then 60s lockout)
4. Enter Full Name + Enrollment Number
5. System verifies → Shows certificate info → One-click PDF download

### Security Features

- **Math CAPTCHA** — randomly generated arithmetic questions
- **3-attempt lockout** — 60-second block after 3 failed CAPTCHAs
- **Name matching** — loose case-insensitive name verification
- **Enrollment-only lookup** — no data exposed until verified
- **Phone stored admin-side** — students never see the phone proof

---

## 📲 SMS Confirmation Setup (Fast2SMS)

When admin **accepts** a blood test request, an SMS is automatically sent to the customer's phone number they provided at booking time.

### Step 1 — Get Fast2SMS API Key
1. Register at [https://fast2sms.com](https://fast2sms.com)
2. Go to **Dev API** section → copy your API key
3. Add balance (₹50 minimum — very affordable for India)

### Step 2 — Deploy the Appwrite Function
In your Appwrite Console:
1. Go to **Functions** → Create Function
2. Name: `send-sms`, Runtime: **Node.js 21**
3. Upload the `functions/send-sms/` folder
4. Set **Entry point**: `src/main.js`
5. Add **Environment Variable**:
   - Key: `FAST2SMS_API_KEY`
   - Value: your Fast2SMS API key
6. Set permissions: **Execute — Any** (so your frontend can call it)
7. Copy the Function ID → add to your `.env` as `VITE_APPWRITE_SMS_FUNCTION_ID`

### SMS Message Content

**When Accepted:**
> Dear [Name], your Blood Test appointment at RAJ INSTITUTE OF MEDICAL SCIENCES (RIMS) has been CONFIRMED. Our team will contact you to confirm your slot. For help call: +91 74885 37035. -Dr. Pankaj Kumar

**When Rejected:**
> Dear [Name], we regret that your Blood Test request at RIMS could not be confirmed at this time. Please call +91 74885 37035 to reschedule. -Dr. Pankaj Kumar, RIMS

### Admin Dashboard Changes
- Accept button now shows **"Accept + SMS"** label
- During processing shows **"⏳ Sending..."**
- After success: green toast → "✅ Request accepted & SMS confirmation sent to [phone]"
- If SMS fails: orange warning toast → still tells admin to call manually
- Accepted/Rejected cards show a **📲 SMS Sent** badge
