# Dynamic RAG Application - Setup Guide

This guide provides step-by-step instructions to set up and run the Dynamic RAG application locally. The project consists of a Dockerized PostgreSQL database, a FastAPI backend, and a React (Vite) frontend.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Python 3.10+](https://www.python.org/)
- [Node.js](https://nodejs.org/) (or [Bun](https://bun.sh/))

---

## 1. Database Setup (Docker)

We use Docker Compose to run a PostgreSQL database and pgAdmin for management.

1.  **Navigate to the project root:**

    ```bash
    cd /path/to/dynamic-rag
    ```

2.  **Start the services:**

    ```bash
    docker-compose up -d
    ```

    This will start:

    - **Postgres DB**: Running on port `5432`.
      - Default User: `postgres`
      - Default Password: `postgres`
      - DB Name: `app_db`
    - **pgAdmin**: Running on port `5050`.
      - Email: `admin@admin.com`
      - Password: `root`

---

## 2. Backend Setup

The backend is built with FastAPI.

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**

    ```bash
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    Ensure you have a `.env` file in the `backend/` directory with the necessary configurations (Database URL, API Keys, etc.).

5.  **Run the Backend Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will be available at `http://localhost:8000`.
    API Documentation: `http://localhost:8000/docs`

---

## 3. Frontend Setup

The frontend is a React application using Vite.

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend-v2
    ```

2.  **Install dependencies:**
    Using Bun (Recommended):

    ```bash
    bun install
    ```

    OR using npm:

    ```bash
    npm install
    ```

3.  **Run the Frontend Server:**
    Using Bun:

    ```bash
    bun run dev
    ```

    OR using npm:

    ```bash
    npm run dev
    ```

    The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

---

## Service Overview

| Service      | Port   | Description      |
| :----------- | :----- | :--------------- |
| **Frontend** | `5173` | React UI         |
| **Backend**  | `8000` | FastAPI Server   |
| **Database** | `5432` | PostgreSQL       |
| **pgAdmin**  | `5050` | Database Manager |

## Troubleshooting

- **Database Connection Refused**: Ensure the Docker container is running (`docker ps`) and the credentials in your backend `.env` match the `docker-compose.yml`.
- **Port Conflicts**: Verify that ports 5432, 8000, and 5173 are free before starting.
- **CORS Errors**: The backend is configured to allow all origins (`"*"`) for development. If you face issues, check `backend/app/main.py`.
