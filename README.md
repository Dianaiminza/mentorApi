# Mentor API

# Overview

The Mentor API is a robust and scalable backend service designed to facilitate mentorship programs. It provides endpoints for managing mentors, mentees, sessions, and feedback, allowing for seamless integration into various mentorship platforms.

# Features
- User Management: Register, authenticate, and manage mentors and mentees.
- Session Scheduling: Create, update, and manage mentorship sessions.
- Feedback System: Collect and analyze feedback from sessions.
- Secure Authentication: JWT-based authentication for secure API access.

# Technologies Used
- Node.js: Runtime environment for executing JavaScript on the server.
- Express.js: Fast, unopinionated, minimalist web framework for Node.js.
- Firebase: Real-time NoSQL database for flexible and scalable data storage.
- JWT: JSON Web Tokens for secure user authentication.
- Bcrypt: Library for hashing passwords securely.

# Getting Started
# Prerequisites
- Node.js (v16 or later)
- Firebase (set up your Firebase project and Firestore database)
  
# Installation

# Clone the repository:
git clone https://github.com/Dianaiminza/MentorApi.git

cd MentorApi

# Install dependencies:
npm install

# Set up environment variables:

Create a .env file in the root directory and add the following variables:

PORT=5000

JWT_SECRET=your_jwt_secret

# Start the server:

npm start


