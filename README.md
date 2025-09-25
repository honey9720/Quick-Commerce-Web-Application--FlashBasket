Quick Commerce Web Application – FlashBasket

Live Site URL: https://quick-commerce-web-application-wir1.onrender.com

A MERN stack-based quick commerce platform that allows users to browse products, add to cart, and place orders with an admin dashboard for product and order management.

🚀 Setup Instructions
1. Clone the repository

git clone https://github.com/honey9720/Quick-Commerce-Web-Application--FlashBasket.git

cd Quick-Commerce-Web-Application--FlashBasket

2. Install dependencies

For backend:
cd backend
npm install

For frontend:
cd frontend
npm install

3. Configure environment variables

Create a .env file in the backend folder with values like:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key # if payments are used

4. Run the application

Run backend:
cd backend
npm start

Run frontend:
cd frontend
npm start

The app will be available at:

Frontend → http://localhost:3000

Backend → http://localhost:5000

🛠 Tech Stack

Frontend: React.js, Redux, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT

Payment (optional): Stripe

📌 Features

User registration & login

Browse and search products

Add to cart & place orders

Admin dashboard to manage products & orders

Secure authentication with JWT
