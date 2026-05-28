# MERN Restructuring - Complete Migration Guide

## ✅ Step 1: BACKUP (IMPORTANT!)
Before moving files, backup your project:
```bash
git add .
git commit -m "Backup before MERN restructuring"
```

---

## 📋 Step 2: FILES TO MOVE

### FROM ROOT TO `frontend/`
Move these files/folders from project root to `frontend/` folder:

**Folders:**
- ✅ `src/` → `frontend/src/`
- ✅ `.tanstack/` → `frontend/.tanstack/`

**Files:**
- ✅ `package-lock.json` → `frontend/package-lock.json`
- ✅ `bun.lock` → `frontend/bun.lock`

**Files ALREADY CREATED in frontend/ (DO NOT move from root):**
- ✅ `package.json` (NEW - already created with updated scripts)
- ✅ `vite.config.ts` (NEW - already created)
- ✅ `tsconfig.json` (NEW - already created)
- ✅ `components.json` (NEW - already created)
- ✅ `eslint.config.js` (NEW - already created)
- ✅ `prettierrc` (NEW - already created)
- ✅ `prettierignore` (NEW - already created)
- ✅ `bunfig.toml` (NEW - already created)
- ✅ `.env.example` (NEW - already created)

---

## 🔧 Step 3: COMMANDS TO RUN (STEP-BY-STEP)

### Option A: Using Terminal Commands (Recommended for Windows)

Open PowerShell/CMD in the IntellMeet root directory and run these commands:

```powershell
# 1. Move src folder to frontend
Move-Item -Path "src" -Destination "frontend/src"

# 2. Move build/vite lock files if they exist
if (Test-Path "bun.lock") { Move-Item -Path "bun.lock" -Destination "frontend/bun.lock" }
if (Test-Path "package-lock.json") { Move-Item -Path "package-lock.json" -Destination "frontend/package-lock.json" }

# 3. Move .tanstack if it exists
if (Test-Path ".tanstack") { Move-Item -Path ".tanstack" -Destination "frontend/.tanstack" }

# 4. Create backend .env file
Copy-Item -Path "backend/.env.example" -Destination "backend/.env"

# 5. Create frontend .env file
Copy-Item -Path "frontend/.env.example" -Destination "frontend/.env"

# 6. Verify structure
Write-Host "Frontend structure:"
Get-ChildItem -Path "frontend" | Select-Object Name
Write-Host "`nBackend structure:"
Get-ChildItem -Path "backend" | Select-Object Name
```

### Option B: Using Git Bash (Alternative)

```bash
# 1. Move src folder to frontend
mv src frontend/

# 2. Move lock files
[ -f "bun.lock" ] && mv bun.lock frontend/
[ -f "package-lock.json" ] && mv package-lock.json frontend/

# 3. Move .tanstack
[ -d ".tanstack" ] && mv .tanstack frontend/

# 4. Create .env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 5. Verify structure
echo "Frontend contents:"
ls -la frontend/ | head -20
echo -e "\nBackend contents:"
ls -la backend/ | head -20
```

---

## 📝 Step 4: DELETE OLD ROOT FILES (After Moving)

These files should be DELETED from root (they're now in frontend/):

```powershell
# After files are moved, delete these from ROOT
Remove-Item -Path "package.json" -Force
Remove-Item -Path "vite.config.ts" -Force
Remove-Item -Path "tsconfig.json" -Force
Remove-Item -Path "components.json" -Force
Remove-Item -Path "eslint.config.js" -Force
Remove-Item -Path "prettierrc" -Force
Remove-Item -Path "prettierignore" -Force
Remove-Item -Path "bunfig.toml" -Force
```

**OR with Git Bash:**
```bash
rm -f package.json vite.config.ts tsconfig.json components.json eslint.config.js prettierrc prettierignore bunfig.toml
```

---

## ✨ Step 5: SETUP & INSTALLATION

### 5.1 Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Output should show:**
```
added XXX packages, and audited YYY packages
```

### 5.2 Install Backend Dependencies

```bash
cd ../backend
npm install
```

**Output should include:**
```
added express, cors, dotenv, socket.io, mongoose, nodemon, etc.
```

---

## 🚀 Step 6: VERIFY EVERYTHING WORKS

### 6.1 Test Frontend (Terminal 1)
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **Check:** Open `http://localhost:5173` in browser - your app should load

### 6.2 Test Backend (Terminal 2)
```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Backend server is running at http://localhost:5000
📍 Frontend URL: http://localhost:5173
🔧 Environment: development
```

✅ **Check:** Open `http://localhost:5000/api/health` in browser - should return:
```json
{
  "status": "OK",
  "timestamp": "2024-05-28T...",
  "uptime": X.XXX
}
```

---

## 📁 Final Project Structure

```
IntellMeet/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── assets/
│   │   ├── router.tsx
│   │   ├── server.ts
│   │   ├── start.ts
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   ├── components.json
│   ├── bunfig.toml
│   ├── prettierrc
│   ├── prettierignore
│   ├── .env.example
│   ├── .env (local - not in git)
│   ├── package-lock.json
│   ├── bun.lock
│   └── node_modules/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── userController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── users.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── .env.example
│   ├── .env (local - not in git)
│   ├── package.json
│   └── node_modules/
│
├── README.md (NEW - comprehensive project docs)
├── .gitignore (UPDATED - root level)
└── .git/
```

---

## ✅ Verification Checklist

- [ ] `src/` folder moved to `frontend/src/`
- [ ] `package-lock.json` moved to `frontend/`
- [ ] `bun.lock` moved to `frontend/`
- [ ] Old root config files deleted
- [ ] `frontend/npm install` completed successfully
- [ ] `backend/npm install` completed successfully
- [ ] `npm run dev` works in frontend/ folder
- [ ] `npm run dev` works in backend/ folder
- [ ] Frontend loads at `http://localhost:5173`
- [ ] Backend API responds at `http://localhost:5000/api/health`
- [ ] No import errors in browser console
- [ ] ESLint passes: `npm run lint` in frontend/
- [ ] Git status clean: `git status`

---

## 🚨 Common Issues & Fixes

### Issue: "Cannot find module @/..." in frontend
**Solution:** This is normal during Vite build. Make sure `frontend/tsconfig.json` has correct paths.

### Issue: "Port 5173 already in use"
**Solution:** Kill the process or use: `npm run dev -- --port 5174`

### Issue: "Backend CORS error in console"
**Solution:** Make sure `FRONTEND_URL` in `backend/.env` matches your frontend URL.

### Issue: Files still in root after moving
**Solution:** Check if they were copied instead of moved. Delete root versions manually.

### Issue: "nodemon: command not found"
**Solution:** Run `npm install` in backend/ folder again

---

## 🎯 Next Steps

After completing restructuring:

1. **Add environment-specific configs** if needed
2. **Setup MongoDB** when ready to implement database
3. **Implement authentication** using JWT
4. **Add Socket.io** handlers for real-time features
5. **Setup CI/CD** pipeline
6. **Deploy** to production

---

## 📞 Support

If something breaks after restructuring:
1. Check this guide's "Common Issues" section
2. Verify all files moved correctly
3. Run `npm install` in both frontend/ and backend/
4. Check console logs for errors
5. Use `git status` to see what changed

**Original frontend code is preserved - no logic was modified!**
