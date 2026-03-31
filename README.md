# Medicore 🏥
> Hospital Management System built with Node.js Microservices + MongoDB + API Gateway

---

## 📁 Folder Structure

```
hospital-microservices/
├── api-gateway/
│   ├── config/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   └── package.json
├── patient-service/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── patientController.js
│   ├── models/
│   │   └── Patient.js
│   ├── routes/
│   │   └── patientRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   └── package.json
├── doctor-service/         (same structure)
├── appointment-service/    (same structure)
├── pharmacy-service/       (same structure)
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI

---

## 🚀 How to Run

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/hospital-microservices.git
cd hospital-microservices
```

### 2. Configure .env for each service
Each service has a `.env.example` — copy and fill it:
```bash
cp patient-service/.env.example patient-service/.env
# Edit MONGO_URI if using Atlas
```

### 3. Install & start each service (5 terminals)

```bash
# Terminal 1
cd patient-service && npm install && npm start

# Terminal 2
cd doctor-service && npm install && npm start

# Terminal 3
cd appointment-service && npm install && npm start

# Terminal 4
cd pharmacy-service && npm install && npm start

# Terminal 5 (start LAST)
cd api-gateway && npm install && npm start
```

---

## 🌐 URLs

| Service | Direct | Via Gateway |
|---------|--------|-------------|
| Patient | http://localhost:3001/patients | http://localhost:3000/api/patients |
| Doctor | http://localhost:3002/doctors | http://localhost:3000/api/doctors |
| Appointment | http://localhost:3003/appointments | http://localhost:3000/api/appointments |
| Pharmacy | http://localhost:3004/medicines | http://localhost:3000/api/medicines |

### Gateway Single-Port Access (Port 3000)

The API Gateway removes the need for clients to remember multiple service ports.

- Without gateway: client must call `3001`, `3002`, `3003`, `3004` directly.
- With gateway: client calls one port only (`3000`) and gateway routes requests internally.
- Benefit: easier frontend integration, cleaner security policy, and centralized monitoring.

### Database Strategy for Microservices

For microservices architecture, option 1 is better because each service keeps its own data boundary.

### Swagger Docs
| Service | Native Swagger | Via Gateway |
|---------|----------------|-------------|
| API Gateway (All Services) | - | http://localhost:3000/docs |
| Patient | http://localhost:3001/api-docs | http://localhost:3000/docs/patients |
| Doctor | http://localhost:3002/api-docs | http://localhost:3000/docs/doctors |
| Appointment | http://localhost:3003/api-docs | http://localhost:3000/docs/appointments |
| Pharmacy | http://localhost:3004/api-docs | http://localhost:3000/docs/pharmacy |

---

## 👥 Group Members

| Member | Service | Port |
|--------|---------|------|
| Pathiraja H.P.M.O.N.  | Patient Service | 3001 |
| Weerakoon W.M.D.P.  | Doctor Service | 3002 |
| Chandrasekara C.M.P.V | Appointment Service | 3003 |
| Abeysekara W.R.G.M  | Pharmacy Service | 3004 |

