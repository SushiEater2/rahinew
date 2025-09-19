# 🧪 Login Test Instructions

## How to Test the Login Functionality

### 1. Start the Development Server
```bash
npm run dev
```
The server should start at `http://localhost:5173`

### 2. Access the Login Page
Navigate to: `http://localhost:5173/login.html`

### 3. Use Test Credentials
**For Tourist Dashboard Access:**
- **Email:** `anike@example.com`
- **Password:** `asdfghjkl`

### 4. Expected Flow
1. Enter the credentials in the "Tourist" tab
2. Click "Login" 
3. You should be automatically redirected to the dashboard at `/dashboard`
4. The dashboard should show:
   - Welcome message with "Anike Kumar"
   - Profile information with email and tourist ID
   - Mock alerts (Weather Advisory and Tourist Safety Update)
   - Safety status indicator
   - Quick action buttons

### 5. Features Available
- **Mock Authentication:** Works offline without backend
- **Persistent Sessions:** Refresh the page, and you stay logged in
- **Logout:** Click logout button to clear session
- **Dashboard:** View profile, alerts, and safety status

### 6. Troubleshooting
If login fails:
- Check browser console for errors
- Verify credentials exactly match (case-sensitive)
- Clear localStorage if needed: `localStorage.clear()`

### 7. Backend Integration
The system will automatically try backend authentication first, then fall back to mock authentication if backend is not available.

---

## Dashboard Features Implemented
✅ User profile display
✅ Mock alerts system  
✅ Safety status indicator
✅ Quick action buttons
✅ Logout functionality
✅ Responsive design
✅ Session persistence