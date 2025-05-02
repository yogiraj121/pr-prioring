🎫 Ticket System – MERN Stack Project
A role-based support ticket management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It allows Admins, Support Agents, and Customers to manage and track tickets efficiently.


Demo-Link : (https://pr-prioring-97bx.vercel.app/)

🛠 Setup Instructions
1. Clone the Repository

git clone https://github.com/yogiraj121/pr-prioring.git

cd pr-prioring


2.Backend Setup
 
cd server

npm i

node server.js / npx nodemon / npm run dev


3.Frontend Setup
 
cd client

npm install

npm run dev




🚀 Features Implemented

Ticketing System: Create, view, update tickets with comments and role-restricted actions.

Chatbot Integration: Handles user queries, links them to Admins. through the tickets, and allows tracking from the admin side.

Dashboard Page:- Where Admin can view all tickets. and member can see their specific assign tickets.

Analytics Page :- where admin or member can track key analytics like missed chats, average response time, and ticket resolution stats and total chats.

Contact Center Page:- Admins assign chats to support agents who can respond through their dashboard and also for chatting.

Team Management Page:- Admins can manage team members and edit, delete and create them.

Chatbot Customisation page:- Where admin or member can customise user interface .

Profile page:- Where user can see their profile and also update. 


-Authentication & Authorization

-JWT-based secure authentication.

JWT-based Authentication with secure role-based access (Admin, Member , User).


Role-based access control:

Admin: Full access, user/ticket management.

Support Agent: View and chat assigned tickets.

Customer: Create personal tickets.


🔧 Additional Features.

Toast notifications.

Basic CSS styling.

Secure API routes.



👥 Demo Credentials
You can use the following demo accounts:

🔸 Admin

Username: www@gmail.com

Password: wwwwww


🔸 Member

Username: doctor@g.com

Password: doctor
