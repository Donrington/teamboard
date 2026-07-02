  
 
 
Full Stack Code Assessment (React + NestJS + MongoDB) 
 
Project Title: TeamBoard – Lightweight Work Management Platform 
 
Objective 
 
You are to build the foundation of a small internal platform called TeamBoard that helps teams manage projects and tasks collaboratively. 
 
The goal is to evaluate your ability to design, structure, and implement a functional full-stack system using NestJS (backend), React (frontend), and MongoDB (database). You have complete freedom over architecture and design decisions. 
 
➢ Core Challenge 
 
Implement a minimal but functional version of TeamBoard that demonstrates: 
 
User authentication (signup and login) 
 
Project and task management (each project can have multiple tasks) 
 
A clear frontend and backend integration flow 
 
A modular structure that could evolve into microservices 
 
 
The focus is on your technical decisions, code organization, and system design thinking, not just on the number of features completed. 
 
 
➢ Requirements 
 
Backend (NestJS + MongoDB) 
 
You are free to choose how to structure your backend, but it should include: 
 
A basic authentication system (JWT recommended) 
 
Models for User, Project, and Task 
 
Task operations (create, update, delete, fetch) 
 
A structure that could evolve into microservices 
 
 
➢	You are encouraged to: 
 
Use NestJS modules and providers appropriately 
 
Apply DTOs and validation 
 
Show clear separation of business logic and controllers 
 
Use environment variables and proper configuration management 
 
Optionally demonstrate how you would extend this to a microservice-based architecture (e.g., AuthService, ProjectService, etc.) 
 
 
➢	Frontend (React) 
 
You are free to decide your structure, but it should demonstrate: 
 
Authentication (login/signup flow) 
 
Viewing and managing projects and their tasks 
 
Integration with the backend API 
 
Organized folder structure (e.g., features, components, services) 
 
State management of your choice (Context API, Redux Toolkit, or React Query) 
 
Basic routing and protected pages 
 
A clean, functional interface is preferred over visual design. Functionality and code clarity are the main focus. 
 
 
➢	Technical Stack 
 
Backend: NestJS, TypeScript, MongoDB, Mongoose 
 
Frontend: React (Vite or CRA), TypeScript optional 
 
Optional: Docker for local setup, Postman collection for API testing 
 
 
Bonus Considerations 
 
➢	Extra credit for: 
 
Implementing a gateway or service-to-service pattern 
 
Introducing message queues (RabbitMQ, Redis pub/sub) 
 
Using Docker Compose for service orchestration 
 
Clean TypeScript interfaces shared between backend and frontend 
 
Deployment to a cloud provider (Render, Railway, Vercel) 
 
Adding minimal automated tests (unit or integration) 
 
 
➢	Deliverables 
 
A GitHub repository containing both: 
 
/backend folder (NestJS source) 
 
/frontend folder (React source) 
 
 
➢ A README.md file that includes: 
 
Setup and run instructions 
 
Architecture overview (monolith or microservice, reasoning) 
 
Notes on design decisions and trade-offs 
