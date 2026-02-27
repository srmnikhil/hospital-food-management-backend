# 🏥 Hospital Food Management System – Backend

The backend of the Hospital Food Management System handles all server-side operations including authentication, patient management, diet charts, inventory tracking, and meal status updates.

It provides secure REST APIs and ensures smooth communication between users and the database.

---

## 🚀 Overview

The backend is responsible for:

- Managing patient records and diet charts  
- Handling authentication and role-based access  
- Coordinating pantry, nutritionist, and delivery workflows  
- Generating operational reports  
- Ensuring data integrity and security  

The system is built using a scalable and modular architecture.

---

## ✨ Features

- RESTful API architecture  
- JWT-based authentication  
- Role-based authorization (Admin, Nutritionist, Pantry, Delivery, Viewer)  
- Patient management APIs  
- Diet chart management APIs  
- Meal scheduling and tracking APIs  
- Inventory management system  
- Report generation endpoints  
- Centralized error handling  
- Secure password hashing  

---

## 🛠️ Tech Stack

### Runtime Environment
- Node.js  

### Framework
- Express.js  

### Database
- MongoDB  
- Mongoose ODM  

### Authentication & Security
- JSON Web Token (JWT)  
- bcrypt  

### Development Tools
- Nodemon  
- ThunderClient  
- dotenv  

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/srmnikhil/hospital-food-management-backend.git
cd hospital-food-management-backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the server:

```bash
npm run dev
```

Or:

```bash
npm start
```

Server runs at:

```
http://localhost:5000
```

---

## 📂 Project Structure

```bash
backend/
 ├─ config/
 │   └─ db.js
 ├─ controllers/
 ├─ middleware/
 │   ├─ authMiddleware.js
 │   └─ roleMiddleware.js
 ├─ models/
 ├─ routes/
 ├─ utils/
 ├─ .env
 ├─ server.js
 └─ package.json
```

---

## 🔐 Authentication & Authorization

The backend uses JWT-based authentication to secure protected routes.

### Authentication Flow

1. User logs in with credentials  
2. Password is verified using bcrypt  
3. JWT token is generated  
4. Token must be included in request headers  

Example:

```bash
Authorization: Bearer <token>
```

---

## 👥 User Roles & Permissions

### Admin
- Full system access  
- Manage users and roles  
- Monitor reports and inventory  

### Nutritionist
- Create and update diet charts  
- Assign meal plans to patients  
- Review patient dietary history  

### Pantry Staff
- View meal preparation tasks  
- Update preparation status  
- Track ingredient usage  

### Delivery Staff
- View delivery assignments  
- Update meal delivery status  

### Viewer
- Read-only access  
- Can view patient and meal data  

---

## 📡 API Modules

### Auth Routes
- Register user  
- Login user  
- Get profile  

### Patient Routes
- Add patient  
- Update patient  
- View patient details  
- Delete patient  

### Diet Routes
- Create diet chart  
- Assign diet plan  
- Update diet details  

### Meal Routes
- Schedule meals  
- Update meal status  
- Track deliveries  

### Inventory Routes
- Add ingredients  
- Update stock levels  
- Low stock alerts  

### Report Routes
- Daily meal report  
- Patient diet report  
- Inventory usage report  

---

## 📊 Error Handling

- Centralized error middleware  
- Proper HTTP status codes  
- Structured JSON responses  

Example:

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

---

## 🔄 Future Improvements

- Real-time updates using WebSockets  
- Automated notification system  
- Audit logs for tracking changes  
- Docker containerization  
- CI/CD integration  

---

## 🤝 Contribution

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📌 Deployment

Before deploying:

- Set production environment variables  
- Use a production MongoDB database  
- Secure your JWT secret  
- Enable HTTPS  

You can deploy using platforms like Render, Railway, AWS, or DigitalOcean.
