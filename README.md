# Balance Box
Balance Box simplifies expense sharing across trips and friends.  Create trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard.  With real-time balances and clear charts, Balance Box keeps everyone fair and stress-free so you can focus on making memories.

# Deployment Links
- Frontend (Vercel): https://split-mate-two.vercel.app/
- Backend (Render): https://splitmate-zqda.onrender.com/

# Features
## ✅ **User Authentication**
 Register/Login with JWT-based auth, auto-redirect to login if token is missing or expired

## 🧳 **Trips Management**
Create trips using usernames of registered users

## 💸 **Expenses Tracking**
Add, edit & delete expenses for each trip with category and split amounts automatically calculated

## 📊 **Charts & Insights**
- User Pie Chart by Category — Total expenses by category for the logged-in user
-  Bar Chart for Last 5 Trips — Total expense share of the logged-in user across their most recent 5 trips

## 📋 **Per-Trip Details**
-  Members Bar Chart — Total expense share per member of the trip
-  Category-wise Pie Chart — Breakup of all trip expenses by category
- Pie chart of the logged-in user’s expenses by category
-  A clear list showing who owes the logged-in user and whom they owe
 - Balance Matrix — Show who owes whom and how much for easy settlement

## 🤝 **Friends & Balances**
-  Send & accept friend requests
-  View incoming & outgoing friend requests separately
-  Friend list with instant balance preview (who owes you or whom you owe)

## 📱 **Fully Responsive UI**
Styled with CSS media queries for mobile, tablet, and desktop compatibility

## ⚠️ **Error Handling**
-  Custom 404 page for missing routes
-  Protected routes with redirect to login if auth token is invalid or expired

## 🚀 **Tech Stack**
-  Frontend: React.js+Vite, Recharts for data visualizations
-  Backend: Node.js, Express.js, MongoDB (hosted on MongoDB Atlas)
-  Deployment: Backend on Render & Frontend on Vercel


