# 🚀 Complete Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide walks you through deploying the **College Complaint Management System** with:
- 🔌 **Backend API**: Hosted on [Render](https://render.com) (connected to MongoDB Atlas)
- 🌐 **Frontend App**: Hosted on [Vercel](https://vercel.com) (connected to Render Backend)
- 🗄️ **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (`college_db`)

> Before starting, install [Git for Windows](https://git-scm.com/download/win) and restart VS Code so the `git` command is available in its terminal. Keep `.env` local; deployment secrets belong in Render and Vercel environment settings, not in Git.

---

## 📋 Overview of Steps

1. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
2. [Step 2: Deploy Backend on Render](#step-2-deploy-backend-on-render)
3. [Step 3: Deploy Frontend on Vercel](#step-3-deploy-frontend-on-vercel)
4. [Step 4: Verify Your Live Deployment](#step-4-verify-your-live-deployment)

---

## Step 1: Push Code to GitHub

### 1.1 Create a New Repository on GitHub
1. Go to [github.com](https://github.com) and sign in.
2. Click the **`+`** icon (top-right) ➔ **"New repository"**.
3. Name your repository (e.g. `college-complaint-management-system`).
4. Set it to **Public** or **Private** (do not initialize with README, license, or .gitignore since we already have them).
5. Click **"Create repository"**.
6. Copy your repository URL (e.g., `https://github.com/YOUR_USERNAME/college-complaint-management-system.git`).

### 1.2 Push Your Local Code to GitHub
Open your terminal in the project directory (`c:\Users\AAMER BAIG\OneDrive\Desktop\project folder1`) and run:

```bash
# 1. Initialize git
git init

# 2. Add all files (the created .gitignore ensures .env and node_modules are safely ignored)
git add .

# 3. Commit files
git commit -m "feat: College Complaint Management System with MongoDB Atlas and fullstack features"

# 4. Set default branch to main
git branch -M main

# 5. Link to your GitHub repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/college-complaint-management-system.git

# 6. Push code to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign in (you can sign in with your GitHub account).
2. On your dashboard, click **"New +"** (top right) ➔ Select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and click **Next**.
4. Connect your GitHub account and select your repository (`college-complaint-management-system`).
5. Fill in the deployment settings:
   - **Name**: `college-complaint-api` (or any unique name)
   - **Region**: Choose the closest region (e.g., *Singapore*, *Frankfurt*, or *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: `.` *(leave blank or enter `.`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: `Free`

6. In MongoDB Atlas, open **Network Access** and allow Render to connect. For a quick deployment, add `0.0.0.0/0`; for production, restrict access to Render's current outbound IP ranges where possible.

7. Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**:
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URI` | Your MongoDB Atlas connection string. Keep this value private and do not commit it. |
   | `NODE_ENV` | `production` |

> Render provides the `PORT` environment variable automatically. The server uses it through `process.env.PORT`, so you normally do not need to add it yourself.

> If the MongoDB connection string shown in an older version of this guide was ever used, rotate that database password in MongoDB Atlas before deploying.

8. Click **"Create Web Service"** (or "Deploy Web Service").
9. Render will now install dependencies and start the backend. Once it says **"Live"**, copy your backend URL from the top of the page (e.g. `https://college-complaint-api.onrender.com`).

> 💡 **Health Check**: Test your backend by visiting `https://your-render-url.onrender.com/api/health` in your browser. You should see:
> `{"status":"ok", "service":"College Complaint Management API (MongoDB Atlas)"}`

---

## Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. On your Vercel Dashboard, click **"Add New..."** ➔ **"Project"**.
3. Select your repository (`college-complaint-management-system`) and click **"Import"**.
4. Configure the project settings:
   - **Project Name**: `college-complaint-system` (or any name)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **"Edit"** next to Root Directory and select the **`client`** folder. Click **Continue**.
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*

5. Open the **"Environment Variables"** dropdown:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://your-backend-name.onrender.com` *(Paste your Render Backend URL from Step 2 without a trailing slash)* |

6. Click **"Deploy"**.
7. Vercel will build and deploy the React frontend in ~30 seconds. Once complete, you will receive your live URL (e.g., `https://college-complaint-system.vercel.app`).

---

## Step 4: Verify Your Live Deployment

Open your live Vercel URL in your browser:

1. **Test User Switching**: Try switching between **Student (Alex)** and **Admin (Dean)** using the top persona switcher.
2. **Submit a Complaint**: Click **`+ Report New Issue`**, use the **AI Auto-Categorize** button, and submit a ticket.
3. **Verify Database Persistence**: Check your [MongoDB Atlas Dashboard](https://cloud.mongodb.com) under `college_db` ➔ `complaints` to confirm the new complaint is saved in real-time.
4. **Admin Resolution Flow**: In Admin Desk, assign the ticket to a department and move it to **Resolved**.
5. **Student 5-Star Rating**: Submit a rating and review to close the ticket and view updated live analytics!

---

## 🔄 Updating Your Live App (Continuous Deployment)

Whenever you make changes to your code in the future:
```bash
git add .
git commit -m "Update feature or style"
git push origin main
```
Both Render and Vercel will **automatically rebuild and redeploy** your application within seconds!
