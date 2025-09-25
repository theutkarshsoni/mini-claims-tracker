# Mini Claims Tracker

A full-stack demo built with **React (MUI), Python (FastAPI), and DynamoDB**, showcasing scalable APIs, clean UI, CI/CD pipelines, and testing practices.  

---

## 🚀 Features
- **Frontend (React + MUI):**
  - Claim submission form with validation  
  - Dashboard with DataGrid (list + filter claims)  
  - Responsive design with MUI theming  

- **Backend (Python FastAPI):**
  - CRUD APIs for claims (create, read, update status)  
  - Input validation with Pydantic models  
  - JWT authentication (demo-level)  
  - Unit tests with Pytest  

- **Database (DynamoDB):**
  - Single-table design (PK = ClaimId, SK = Status)  
  - GSI for user-based queries  
  - Conditional writes + paginated queries  

- **DevOps / CI/CD:**
  - Dockerized backend & frontend  
  - GitHub Actions workflow for linting + testing  
  - Ready for deployment on AWS (Lambda + API Gateway + S3)  

---

## 🛠️ Tech Stack
- **Frontend:** React.js, TypeScript, MUI  
- **Backend:** Python, FastAPI  
- **Database:** DynamoDB (AWS)  
- **DevOps:** Docker, GitHub Actions  
- **Testing:** Pytest (backend), React Testing Library (frontend)  

---

## 📂 Project Structure
```
mini-claims-tracker/
  ├── backend/            # FastAPI service
  │   ├── app/            # API routes, models
  │   ├── tests/          # Pytest unit tests
  │   └── Dockerfile
  ├── frontend/           # React + MUI app
  │   ├── src/            # Components, hooks
  │   └── Dockerfile
  ├── .github/workflows/  # CI/CD pipelines
  └── README.md
```

---

## ⚡ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/mini-claims-tracker.git
cd mini-claims-tracker
```

### 2. Run the backend
```bash
cd backend
docker build -t claims-backend .
docker run -p 8000:8000 claims-backend
```
API available at: `http://localhost:8000/docs`

### 3. Run the frontend
```bash
cd frontend
docker build -t claims-frontend .
docker run -p 3000:3000 claims-frontend
```
App available at: `http://localhost:3000`

---

## ✅ Demo Walkthrough
1. Submit a new claim via frontend form  
2. View claim list in dashboard (MUI DataGrid)  
3. Update claim status (Approved/Rejected/Pending)  
4. Data persisted in DynamoDB  

---

## 🔍 Tests
Run backend unit tests:
```bash
cd backend
pytest
```

---

## 📌 Roadmap
- Add authentication with AWS Cognito  
- Add CI pipeline for deployment to AWS (Lambda + S3)  
- Add integration tests  

---