# SplitMate
SplitMate simplifies expense sharing across trips and friends.  Create trips, add expenses, track who owes whom, and view category-wise summaries — all in one intuitive dashboard.  With real-time balances and clear charts, SplitMate keeps everyone fair and stress-free so you can focus on making memories.

# Deployment Links
- Frontend (Vercel): https://split-mate-two.vercel.app/
- Backend (Render): https://splitmate-zqda.onrender.com/

# Features
## ✅ **User Authentication**
 Register/Login with JWT-based auth, auto-redirect to login if token is missing or expired

## 🧳 **Trips Management**
Create trips using usernames of registered users
![Screenshot 2025-06-23 004738](https://github.com/user-attachments/assets/0f0c0ece-368c-4a85-875a-9f8728d2797b)

## 💸 **Expenses Tracking**
Add, edit & delete expenses for each trip with category and split amounts automatically calculated
![Screenshot 2025-06-23 005013](https://github.com/user-attachments/assets/3f8dda06-9230-4a65-a9b5-5379d82631c8)

## 📊 **Charts & Insights**
- User Pie Chart by Category — Total expenses by category for the logged-in user
-  Bar Chart for Last 5 Trips — Total expense share of the logged-in user across their most recent 5 trips
![Screenshot 2025-06-23 004705](https://github.com/user-attachments/assets/f4431877-6d8e-4b10-a759-e3ed8d6e67dd)

## 📋 **Per-Trip Details**
-  Members Bar Chart — Total expense share per member of the trip
-  Category-wise Pie Chart — Breakup of all trip expenses by category
![Screenshot 2025-06-23 004759](https://github.com/user-attachments/assets/3e71e7dc-462a-4d49-a1d0-072c0469b1cb)
- Pie chart of the logged-in user’s expenses by category
-  A clear list showing who owes the logged-in user and whom they owe
![Screenshot 2025-06-23 004823](https://github.com/user-attachments/assets/ed2d0b60-ad52-45f1-8033-1caa2c210420)
- Split Matrix — Show who owes whom and how much for easy settlement
![Screenshot 2025-06-23 004910](https://github.com/user-attachments/assets/2598eb3b-d0d5-4b85-8b43-57bed4c774c5)

## 🤝 **Friends & Balances**
-  Send & accept friend requests
![Screenshot 2025-06-23 005058](https://github.com/user-attachments/assets/feed4b2a-5a6b-44d4-a532-665676280e6b)
-  View incoming & outgoing friend requests separately
![Screenshot 2025-06-23 005116](https://github.com/user-attachments/assets/b2155bda-f1bb-4fe9-be3c-f32b668ba133)
-  Friend list with instant balance preview (who owes you or whom you owe)
-  ![Screenshot 2025-06-23 005040](https://github.com/user-attachments/assets/8836fdd8-f4be-4681-a6a5-d4db374f684b)

## 📱 **Fully Responsive UI**
Styled with CSS media queries for mobile, tablet, and desktop compatibility

## ⚠️ **Error Handling**
-  Custom 404 page for missing routes
-  Protected routes with redirect to login if auth token is invalid or expired

## 🚀 **Tech Stack**
-  Frontend: React.js+Vite, Recharts for data visualizations
-  Backend: Node.js, Express.js, MongoDB (hosted on MongoDB Atlas)
-  Deployment: Backend on Render & Frontend on Vercel


