# Zestify E-commerce

This is a full-stack e-commerce project built using **Next.js** for the frontend, **Node.js** with **Express** for the backend, and **MongoDB** for the database. The application includes the following features:

- **User Authentication**: Users can register, log in, and manage their accounts using JWT-based authentication.
- **Product Listings**: Display products with details such as images, prices, and descriptions.
- **Shopping Cart**: Users can add products to their cart and proceed to checkout.
- **Order Management**: Users can view their order history.
- **Admin Panel**: Admins can manage users, products, and orders through a secure dashboard.

---

## Technologies Used

- **Next.js** - React framework for building the frontend.
- **Node.js** - JavaScript runtime used for the backend server.
- **MongoDB** - NoSQL database for storing data.
- **JWT Authentication** - For secure user login and access control.
- **Toastify** - For notifications in the frontend.

---

## Features

- **User Login/Registration**: Users can create an account or log in using JWT-based authentication. This allows users to securely access personalized features such as their cart, order history.
  
- **Add to Cart Functionality**: Users can browse products and add them to their shopping cart. The cart is stored in the backend, so it persists across sessions and devices when logged in.

- **View Cart**: Users can view their shopping cart, check the items added, modify quantities, or remove products before proceeding to checkout.

- **Checkout & Order Placement**: Once users are ready to purchase, they can proceed to checkout where they can place an order. The order details are stored and linked to their user profile.

- **Order History & Status Updates**: Users can view their past orders, including order status.

- **Admin Panel**: The admin panel allows authorized users to manage products, users, and orders. Admins can add, update, or delete products and users, view user orders, and manage user accounts, all through a secure interface.
  


---

## Getting Started

These instructions will help you set up your project locally for development and testing.

### Prerequisites



1.  Navigate to the backend folder
```bash
cd backend
```

2. Install necessary packages like Express and other dependencies
```bash
npm install express mongoose dotenv
```

3. In `.env` file in the `backend` folder with the following content:
```env
PORT=5000
MONGO_URI=your-db-or-atlas-url
JWT_SECRET=your-jwt-secret-key
```

4. Run the backend server using `nodemon`:
```bash
npx nodemon server.js
```
In the terminal, you should see something like this:
```
[nodemon] 3.1.9
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
🚀 Server running at http://localhost:5000
✅ MongoDB connected
```
5. **Add Initial Product Data**

   Import the `products.json` file from the `db` folder into **MongoDB Compass** or your preferred MongoDB client (e.g., MongoDB Atlas). This will populate your database with the initial set of products to display in the app.

   - Open **MongoDB Compass** or connect to your MongoDB instance.
   - Select the appropriate database and collection (e.g., `products`).
   - Use the **Import Data** option to import the `products.json` file.

6. **Seed Additional Data (if needed)**

   If you have additional collections (e.g., categories, users, or orders), import the corresponding JSON files into the appropriate collections in your MongoDB instance.

   Ensure all the necessary data files are placed in the `db` folder and imported to match the expected schema.

---

7. Step Two: Navigate to the frontend folder in a new terminal window
```bash
cd frontend
```

8. Install all the necessary frontend dependencies:
```bash
npm install
```

9. Run the frontend development server:
```bash
npm run dev
```
You should see something like this:
```
> frontend@dev
> next dev

ready - started server on http://localhost:3000
```
The frontend should now be running on `http://localhost:3000`.

Before starting, make sure you have these tools installed on your system:

- **Node.js** (LTS version)  > This project was developed using Node.js version 22.14.0
- **MongoDB** (You can use MongoDB Atlas for a cloud instance or install it locally)

---
### 🛠 Admin User Setup

This project includes a custom script to create an admin user for managing the platform.

#### Steps to Create an Admin User:

1. Open your terminal and navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Run the following command:

   ```bash
   npm run makeadmin
   ```

3. You'll be prompted to enter admin details:

   ```
   > server@1.0.0 makeadmin
   > node scripts/createAdmin.js

   Enter admin name: kjhu
   Enter admin email: adminw@gmail.com
   Enter admin password: 12345
   ✅ Admin user created successfully!
   ```


>🔐 Logging into the Admin Panel

You can log in to the admin panel using the same login page as regular users.

Simply enter the admin credentials you created above (email & password).

The system will automatically recognize the admin account based on the isAdmin: true flag in the database.



