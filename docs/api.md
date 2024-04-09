## RESTful Routes

### Products

GET /products: Fetch all products
GET /products/:id: Fetch a single product by ID
POST /products: Create a new product (Admin only)

### Users

GET /users: Fetch all users (Admin only)
GET /users/:id: Fetch a single user by ID (Admin or same user)
POST /users: Register a new user

### Orders

GET /orders/current/:userId: Fetch the current order for a user
POST /orders/:userId: Create a new order for a user

## Database Schema Design

### Products Table

id: Primary Key
name: Text
price: Numeric
category: Text (Optional)

### Users Table

id: Primary Key
firstName: Text
lastName: Text
password: Text (hashed)

### Orders Table

id: Primary Key
user_id: Foreign Key to Users
status: Text (e.g., "active", "complete")

### Order_Items Table (To link products and orders)

id: Primary Key
order_id: Foreign Key to Orders
product_id: Foreign Key to Products
quantity: Integer
