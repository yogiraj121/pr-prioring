# 🎫 Ticket System – MERN Stack Project

A **role-based support ticket management system** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It enables **Admins**, **Support Agents**, and **Customers** to manage and track tickets efficiently with a fully integrated **chatbot** and analytics dashboard.

---

## 🔗 Live Demo

👉 [View Live Demo](https://pr-prioring-97bx.vercel.app/)

---

## 🛠 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yogiraj121/pr-prioring.git
cd pr-prioring


Backend
cd server
npm install

# Start the backend server
node server.js
# or
npx nodemon
# or
npm run dev

Frontend
cd ../client
npm install
npm run dev


🚀 Features Implemented
🎟 Ticketing System
Create, view, and update tickets with comment support.

Role-restricted actions (Admin, Support Agent, Customer).

🤖 Chatbot Integration
Handles user queries and links them to Admin via tickets.

Admins can track chats from the dashboard.

📊 Dashboard Page
Admins can view and manage all tickets.

Members see only their assigned tickets.

📈 Analytics Page
Track stats like:

Missed chats

Average response time

Total tickets & resolved issues

📞 Contact Center
Admins assign chats to support agents.

Agents respond to chats from their dashboards.

👥 Team Management
Admins can add, edit, or remove team members.

🎨 Chatbot Customization
Interface to customize chatbot UI by Admin or Member.

👤 Profile Page
View and update personal profile data.

🔐 Authentication & Authorization
JWT-based secure authentication.

Role-based access control:

Admin: Full access, manage users and tickets.

Support Agent (Member): View & respond to assigned tickets.

Customer (User): Submit and track personal tickets.

🛠 Additional Features
Toast notifications for actions.

Secure API routes.

Basic CSS styling for a clean UI.

Responsive and scalable frontend.

👥 Demo Credentials
🔸 Admin
Username: www@gmail.com

Password: wwwwww

🔸 Member
Username: doctor@g.com

Password: doctor


