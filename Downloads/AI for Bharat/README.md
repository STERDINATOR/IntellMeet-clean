# 🕉️ DharmaCodex

**A Gurukul-Inspired Adaptive Programming Education Platform**

> *Where ancient wisdom meets modern technology to forge disciplined, logical thinkers through the art of programming.*

---

## 🌟 Vision & Philosophy

DharmaCodex is not just another coding practice website. It is a **digital Gurukul** — a structured mentorship system that embodies the timeless principles of traditional Indian education, reimagined for the digital age.

Our philosophy centers on:
- **Mastery over speed** — Deep understanding trumps quick completion
- **Discipline over competition** — Personal growth over leaderboards
- **Reflection over repetition** — Thoughtful learning over mechanical practice
- **Guidance over answers** — Mentorship that empowers, never reveals

DharmaCodex trains not just coders, but **logical thinkers, structured reasoners, and disciplined problem-solvers** through a mythologically-themed, pedagogically-sound learning ecosystem.

---

## 🎯 Problem Statement

Modern coding education platforms suffer from critical flaws:

1. **Speed-focused gamification** creates anxiety and discourages deep learning
2. **Penalty-based systems** punish mistakes instead of encouraging exploration
3. **Answer-revealing AI** creates dependency rather than independence
4. **One-size-fits-all approaches** ignore individual learning patterns
5. **Lack of parental/teacher governance** in child-focused platforms
6. **Unsafe code execution** environments pose security risks
7. **Competitive pressure** undermines intrinsic motivation

These issues result in surface-level learning, high dropout rates, and students who can copy code but cannot think algorithmically.

---

## 💡 Solution Overview

DharmaCodex addresses these challenges through:

### 🧘 Gurukul Pedagogy
- Structured learning paths with mastery gating
- Reflection pauses that force conceptual understanding
- Retry-based progression without penalties
- Discipline streaks over competitive rankings

### 🤖 Adaptive AI Without Answer-Revealing
- Layered hint system that guides without solving
- Weakness detection and adaptive difficulty
- Frustration detection with intelligent intervention
- Complete AI transparency logs

### 🔒 Enterprise-Grade Security
- Docker-based sandboxed code execution
- JWT authentication with role-based access control
- Memory and time-limited execution environments
- Network-isolated containers

### 👨‍👩‍👧 Governance & Safety
- Parent dashboard with screen time controls
- Teacher cohort analytics
- Admin feature-flag console
- Child-safe content and interactions

### 🎨 Legendary Mythological UI
- Immersive theme inspired by Indian mythology
- Animated transitions and legendary aesthetics
- Distraction-free focus modes
- Accessibility-compliant design

---

## 🚀 Key Innovations


### 1. **Feature-Flag Driven Architecture**
Every feature is controlled by a dynamic flag system, enabling:
- Gradual rollout to user segments
- A/B testing of pedagogical approaches
- Instant rollback of problematic features
- Lite/Guided/Full mode switching

### 2. **Retry-Based Learning Model**
No penalties, no time pressure — only growth:
- Unlimited attempts without score reduction
- Retry heatmaps showing learning patterns
- Adaptive difficulty based on attempt frequency
- Celebration of persistence over perfection

### 3. **AI Guardrail System**
Strict rules prevent AI from undermining learning:
- Never reveals complete solutions
- Provides layered hints with increasing specificity
- Operates in "silence mode" until thresholds trigger
- Full transparency logs for parents/teachers

### 4. **Step-by-Step Debugger**
Visual execution environment:
- Line-by-line code stepping
- Variable state visualization
- Recursion tree animator
- Loop cycle demonstrator

### 5. **Mastery-Gated Progression**
Unlock next concepts only after demonstrating understanding:
- Concept dependency graphs
- Retention prediction algorithms
- Adaptive revision suggestions
- Wisdom summaries at lesson completion

---

## 🏆 Hackathon Elite 50 Feature Overview

DharmaCodex implements 50 core features across 5 strategic modules:

### 🧩 Module A: Core Foundation (Features 1-10)
- JWT Authentication System
- Role-Based Access Control (Student/Parent/Teacher/Admin)
- Feature-Flag Engine
- Lite/Guided/Full Learning Modes
- Student Dashboard
- Lesson Engine (Concept → Practice → Reflection → Mastery)
- Mastery Gating Logic
- Retry-Based Progression
- Progress Tracking System
- Legendary Themed UI Framework

### 💻 Module B: Coding Engine (Features 11-20)
- Code Editor with Syntax Highlighting
- Secure Sandbox Execution (Docker)
- Step-by-Step Debugger
- Error Explanation Engine
- Output Console
- Infinite Loop Detector
- Recursion Tree Visualizer
- Loop Animator
- Algorithm Comparison View
- Code-to-Flowchart Converter

### 🤖 Module C: AI Personalization (Features 21-30)
- Adaptive Difficulty Engine
- Weakness Detection Engine
- Retry Frequency Analyzer
- Layered Hint System
- AI Silence Mode
- Frustration Detection Logic
- Concept Retention Predictor
- AI Transparency Panel
- Confidence Index Tracker
- Adaptive Revision Suggestion

### 🧠 Module D: Gurukul Pedagogy (Features 31-40)
- Reflection Pause System
- Think-Before-Submit Lock
- Mentor Guidance Hints
- Deep Focus Mode
- Discipline Streak Tracker
- Calm UI Mode
- Concept Dependency Graph
- Wisdom Summary Screen
- Retry Heatmap
- Legendary Completion Animation

### 📊 Module E: Analytics & Governance (Features 41-50)
- Parent Dashboard
- Screen Time Control
- Teacher Cohort Analytics
- Student Mastery Heatmap
- Admin Feature Flag Console
- Real-Time Feature Toggle
- Instant Rollback Mechanism
- Progress Export (PDF)
- Learning Timeline View
- AI Decision Log Viewer

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Flutter)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │    Parent    │  │   Teacher    │      │
│  │  Interface   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │    (FastAPI)    │
                    └────────┬────────┘
                             │
        ┏━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━┓
        ┃                                           ┃
┌───────▼────────┐                      ┌──────────▼─────────┐
│  Auth Service  │                      │  Learning Engine   │
│  (JWT + RBAC)  │                      │  (Adaptive Logic)  │
└───────┬────────┘                      └──────────┬─────────┘
        │                                           │
┌───────▼────────┐                      ┌──────────▼─────────┐
│ Feature Flags  │                      │   AI Engine        │
│    Engine      │                      │ (Hints + Adapt)    │
└───────┬────────┘                      └──────────┬─────────┘
        │                                           │
┌───────▼────────────────────────────────┬─────────▼─────────┐
│         Firebase Firestore             │  Sandbox Engine   │
│  (Users, Progress, Analytics, Flags)   │  (Docker Exec)    │
└────────────────────────────────────────┴───────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Architecture**: Clean Architecture (Presentation → Domain → Data)
- **UI Theme**: Custom legendary mythological design system
- **Animations**: Flutter AnimationController + Hero transitions

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control middleware
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Async Processing**: Python asyncio

### Database
- **Primary Store**: Firebase Firestore
- **Collections**: users, lessons, progress, feature_flags, analytics
- **Real-time**: Firestore listeners for live updates

### Sandbox Execution
- **Container**: Docker with resource limits
- **Isolation**: Network-disabled, filesystem-restricted
- **Languages**: Python (extensible to Java, C++, JavaScript)
- **Limits**: 2s timeout, 128MB memory cap

### AI Layer
- **Engine**: Custom adaptive algorithm (rule-based + ML-ready)
- **Hint Generation**: Template-based with context injection
- **Analytics**: Retry pattern analysis, weakness clustering
- **Guardrails**: Multi-layer validation preventing solution reveal

---

## 📁 Folder Structure

```
dharmacodex/
│
├── frontend/                    # Flutter application
│   ├── lib/
│   │   ├── core/               # Core utilities, constants, themes
│   │   ├── features/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── lessons/
│   │   │   ├── coding/
│   │   │   ├── analytics/
│   │   │   └── admin/
│   │   ├── shared/             # Shared widgets, models
│   │   └── main.dart
│   ├── assets/                 # Images, fonts, animations
│   ├── test/
│   └── pubspec.yaml
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   ├── auth.py
│   │   │   ├── lessons.py
│   │   │   ├── sandbox.py
│   │   │   ├── analytics.py
│   │   │   └── admin.py
│   │   ├── core/               # Config, security, dependencies
│   │   ├── models/             # Pydantic models
│   │   ├── services/           # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── learning_engine.py
│   │   │   ├── ai_engine.py
│   │   │   ├── sandbox_service.py
│   │   │   └── feature_flags.py
│   │   ├── db/                 # Firestore client
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── sandbox/                     # Docker sandbox environment
│   ├── Dockerfile
│   ├── executor.py
│   └── security_config.json
│
├── docs/                        # Documentation
│   ├── README.md
│   ├── DESIGN.md
│   └── API.md
│
└── docker-compose.yml           # Multi-container orchestration
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Flutter SDK 3.16+
- Python 3.11+
- Docker Desktop
- Firebase project with Firestore enabled
- Git

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
flutter pub get

# Create environment configuration
cp .env.example .env

# Edit .env with your Firebase credentials
# FIREBASE_API_KEY=your_api_key
# FIREBASE_PROJECT_ID=your_project_id
# API_BASE_URL=http://localhost:8000

# Run the app
flutter run
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Edit .env with configuration
# JWT_SECRET=your_secret_key_here
# FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
# DOCKER_SANDBOX_IMAGE=dharmacodex-sandbox:latest

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Sandbox Setup

```bash
# Navigate to sandbox directory
cd sandbox

# Build Docker image
docker build -t dharmacodex-sandbox:latest .

# Verify image
docker images | grep dharmacodex-sandbox
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create service account and download JSON key
4. Place key file in `backend/credentials/`
5. Update `FIREBASE_CREDENTIALS_PATH` in backend `.env`

---

## 🔐 Environment Variables

### Frontend (.env)
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
API_BASE_URL=http://localhost:8000
ENABLE_DEBUG_LOGS=true
```

### Backend (.env)
```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Firebase
FIREBASE_CREDENTIALS_PATH=./credentials/serviceAccountKey.json

# Sandbox
DOCKER_SANDBOX_IMAGE=dharmacodex-sandbox:latest
SANDBOX_TIMEOUT_SECONDS=2
SANDBOX_MEMORY_LIMIT=128m

# API
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# Feature Flags
DEFAULT_MODE=guided
ENABLE_AI_ENGINE=true
```

---

## 📡 API Overview

### Authentication Endpoints
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login and get JWT
POST   /api/auth/refresh           # Refresh JWT token
GET    /api/auth/me                # Get current user profile
```

### Lesson Endpoints
```
GET    /api/lessons                # List all lessons
GET    /api/lessons/{id}           # Get lesson details
POST   /api/lessons/{id}/start     # Start a lesson
POST   /api/lessons/{id}/submit    # Submit solution
GET    /api/lessons/{id}/progress  # Get lesson progress
```

### Sandbox Endpoints
```
POST   /api/sandbox/execute        # Execute code in sandbox
POST   /api/sandbox/debug          # Step-by-step debug
GET    /api/sandbox/status/{id}    # Check execution status
```

### Analytics Endpoints
```
GET    /api/analytics/student/{id}      # Student analytics
GET    /api/analytics/mastery-heatmap   # Mastery heatmap
GET    /api/analytics/retry-patterns    # Retry analysis
```

### Admin Endpoints
```
GET    /api/admin/feature-flags         # List all flags
PUT    /api/admin/feature-flags/{id}    # Update flag
POST   /api/admin/rollback              # Instant rollback
GET    /api/admin/ai-logs               # AI decision logs
```

---

## 🚩 Feature-Flag System Explanation

The Feature-Flag Engine is the backbone of DharmaCodex's scalability and safety.

### How It Works

1. **Flag Definition**: Each feature has a unique flag ID stored in Firestore
2. **Evaluation**: On every request, flags are evaluated based on:
   - User role (Student/Parent/Teacher/Admin)
   - User age group
   - Learning mode (Lite/Guided/Full)
   - Rollout percentage (gradual deployment)
3. **Dynamic Response**: Frontend receives only enabled features
4. **Real-time Updates**: Firestore listeners push flag changes instantly

### Flag Schema
```json
{
  "flag_id": "ai_hint_system",
  "enabled": true,
  "rollout_percentage": 100,
  "target_roles": ["student"],
  "target_modes": ["guided", "full"],
  "min_age": 10,
  "dependencies": ["lesson_engine"]
}
```

### Benefits
- **Safe Rollouts**: Test features with 5% of users before full deployment
- **Instant Rollback**: Disable problematic features in seconds
- **A/B Testing**: Compare pedagogical approaches
- **Personalization**: Different experiences for different user segments

---

## 🤖 AI Guardrail Explanation

DharmaCodex's AI never reveals answers — it guides thinking.

### Guardrail Layers

#### Layer 1: Hint Level Restriction
- **Level 1**: Conceptual reminder (e.g., "Remember how loops work?")
- **Level 2**: Structural guidance (e.g., "You need a loop here")
- **Level 3**: Pseudo-code hint (e.g., "for i in range(n):")
- **Never**: Actual solution code

#### Layer 2: Silence Mode
- AI remains silent until:
  - 3+ failed attempts, OR
  - 5+ minutes on same problem, OR
  - User explicitly requests hint

#### Layer 3: Context Validation
- AI analyzes:
  - Current code state
  - Previous attempts
  - Concept mastery level
- Generates hints that address specific gaps

#### Layer 4: Transparency Logging
- Every AI interaction logged:
  - Trigger reason
  - Hint level provided
  - User response
- Parents/teachers can review full history

### Example Flow
```
Attempt 1: [Wrong] → AI Silent
Attempt 2: [Wrong] → AI Silent
Attempt 3: [Wrong] → AI: "Think about how to repeat actions" (Level 1)
Attempt 4: [Wrong] → AI: "You need a for loop structure" (Level 2)
Attempt 5: [Wrong] → AI: "Try: for i in range(5):" (Level 3)
```

---

## 🔒 Sandbox Security Explanation

Code execution is isolated, limited, and monitored.

### Security Measures

#### 1. Docker Containerization
- Each execution runs in a fresh container
- No persistent state between runs
- Container destroyed after execution

#### 2. Resource Limits
```yaml
Memory: 128MB max
CPU: 0.5 core max
Time: 2 seconds timeout
Disk: Read-only filesystem
```

#### 3. Network Isolation
- No internet access
- No external API calls
- Localhost disabled

#### 4. Code Validation
- Syntax check before execution
- Blacklist dangerous imports (os, subprocess, socket)
- AST analysis for malicious patterns

#### 5. Output Sanitization
- Stdout/stderr captured and filtered
- No system information leakage
- Error messages sanitized

### Execution Flow
```
1. User submits code
2. Backend validates syntax
3. Code sent to Docker API
4. Container spawned with limits
5. Code executed in isolation
6. Output captured
7. Container destroyed
8. Results returned to user
```

---

## 🎬 Demo Flow Overview

### Student Journey
1. **Register** → Choose role (Student), set age
2. **Dashboard** → See mastery heatmap, current streak
3. **Start Lesson** → "Introduction to Loops"
4. **Read Concept** → Animated explanation with examples
5. **Practice** → Code editor with problem statement
6. **Submit** → Sandbox executes code
7. **Feedback** → Pass/Fail with error explanation
8. **Retry** → Attempt 3 triggers AI hint (Level 1)
9. **Success** → Legendary completion animation
10. **Reflection** → "Explain in your own words what a loop does"
11. **Mastery** → Lesson marked complete, next unlocked

### Parent Journey
1. **Login** → Parent role
2. **Dashboard** → See child's progress
3. **Screen Time** → Set daily limit (60 minutes)
4. **Analytics** → View mastery heatmap
5. **AI Logs** → Review AI interactions
6. **Export** → Download PDF report

### Teacher Journey
1. **Login** → Teacher role
2. **Cohort View** → See all students in class
3. **Analytics** → Identify struggling students
4. **Intervention** → Assign targeted revision
5. **Progress** → Track class-wide mastery

### Admin Journey
1. **Login** → Admin role
2. **Feature Flags** → View all 50 features
3. **Toggle** → Enable "Recursion Tree Visualizer" for 10% users
4. **Monitor** → Check analytics for issues
5. **Rollback** → Disable feature if problems detected

---

## 🌐 Future Scalability Plan (500-Feature Vision)

DharmaCodex is designed to scale from 50 to 500+ features through modular architecture.

### Phase 1: Foundation (50 Features) ✅
- Core learning engine
- Basic AI adaptation
- Essential governance tools

### Phase 2: Expansion (100 Features)
- Multi-language support (Java, C++, JavaScript)
- Collaborative coding sessions
- Peer review system
- Advanced visualizations (memory diagrams, call stacks)

### Phase 3: Ecosystem (200 Features)
- Marketplace for teacher-created content
- Integration with school LMS systems
- Live mentor sessions
- Gamified challenges (non-competitive)

### Phase 4: Intelligence (300 Features)
- ML-powered weakness prediction
- Natural language code explanations
- Voice-guided coding for accessibility
- Automated curriculum generation

### Phase 5: Community (500 Features)
- Open-source contribution pathways
- Student-created lesson sharing
- Regional language support
- Offline-first mobile experience

### Architectural Readiness
- **Microservices**: Backend can split into independent services
- **Event-Driven**: Kafka/RabbitMQ for async communication
- **Caching**: Redis for performance optimization
- **CDN**: Static asset distribution
- **Kubernetes**: Container orchestration for scale

---

## 📜 License

This project is currently under development for hackathon submission.

License details will be finalized post-hackathon. Intended model: Open-source core with premium governance features.

---

## 👥 Contributors

**Core Team**:
- [Your Name] - Architecture & Backend
- [Team Member 2] - Frontend & UI/UX
- [Team Member 3] - AI Engine & Analytics
- [Team Member 4] - DevOps & Security

**Special Thanks**:
- Mentors and advisors who guided the Gurukul philosophy integration
- Beta testers who provided invaluable feedback
- Open-source community for foundational tools

---

## 🙏 Acknowledgments

DharmaCodex draws inspiration from:
- Traditional Gurukul education systems
- Indian mythology and legendary aesthetics
- Modern pedagogical research on mastery-based learning
- Open-source education initiatives worldwide

---

## 📞 Contact & Support

- **Website**: [Coming Soon]
- **Email**: team@dharmacodex.dev
- **GitHub**: github.com/dharmacodex
- **Discord**: [Community Server Link]

---

**Built with 🕉️ for the next generation of logical thinkers.**
