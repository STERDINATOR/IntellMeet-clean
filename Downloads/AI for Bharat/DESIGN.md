# 🏛️ DharmaCodex — System Design Document

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Hackathon Elite 50 Implementation

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Feature Flag System](#feature-flag-system)
7. [Authentication Flow](#authentication-flow)
8. [Learning Engine Workflow](#learning-engine-workflow)
9. [AI Adaptation Workflow](#ai-adaptation-workflow)
10. [Coding Sandbox Architecture](#coding-sandbox-architecture)
11. [Analytics Engine Design](#analytics-engine-design)
12. [Role-Based Workflows](#role-based-workflows)
13. [Complete Feature Specification](#complete-feature-specification)
14. [UI/UX Design System](#uiux-design-system)
15. [Security Design](#security-design)
16. [Scalability & Expansion](#scalability--expansion)
17. [Deployment Blueprint](#deployment-blueprint)

---

## 1. System Architecture

### 1.1 Layered Architecture Overview

DharmaCodex follows a clean, layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Flutter    │  │   Riverpod   │  │  Legendary   │          │
│  │     UI       │  │State Manager │  │  UI Theme    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              FastAPI Application                      │       │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │       │
│  │  │  Auth  │  │Lessons │  │Sandbox │  │Analytics│    │       │
│  │  │  API   │  │  API   │  │  API   │  │   API   │    │       │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Auth      │  │   Learning   │  │      AI      │          │
│  │   Service    │  │    Engine    │  │    Engine    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Feature    │  │   Sandbox    │  │  Analytics   │          │
│  │    Flags     │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
│  ┌──────────────────────────────────────────────────────┐       │
│  │           Firebase Firestore Client                   │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PERSISTENCE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Users     │  │   Lessons    │  │   Progress   │          │
│  │  Collection  │  │  Collection  │  │  Collection  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Feature Flags │  │  Analytics   │  │   AI Logs    │          │
│  │  Collection  │  │  Collection  │  │  Collection  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   SANDBOX LAYER      │
                    │  ┌────────────────┐  │
                    │  │ Docker Engine  │  │
                    │  │  (Isolated)    │  │
                    │  └────────────────┘  │
                    └──────────────────────┘
```



### 1.2 Component Interaction Flow

```
User Action (Flutter) 
    → State Change (Riverpod)
        → API Call (HTTP Client)
            → Route Handler (FastAPI)
                → Middleware (Auth/RBAC/Feature Flags)
                    → Service Layer (Business Logic)
                        → Data Layer (Firestore)
                            → Response
                                → State Update
                                    → UI Render
```

### 1.3 Key Architectural Principles

1. **Separation of Concerns**: Each layer has a single, well-defined responsibility
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Feature Modularity**: Features can be enabled/disabled independently
4. **Stateless API**: Backend is stateless; all state in Firestore or JWT
5. **Async-First**: Non-blocking operations throughout the stack
6. **Security by Design**: Authentication and authorization at every layer

---

## 2. Frontend Architecture

### 2.1 Clean Architecture Pattern

```
lib/
├── core/
│   ├── constants/          # App-wide constants
│   ├── theme/              # Legendary UI theme
│   ├── utils/              # Helper functions
│   └── errors/             # Error handling
│
├── features/               # Feature modules
│   ├── auth/
│   │   ├── presentation/   # UI widgets, pages
│   │   ├── domain/         # Business logic, entities
│   │   └── data/           # API clients, repositories
│   │
│   ├── dashboard/
│   ├── lessons/
│   ├── coding/
│   ├── analytics/
│   └── admin/
│
└── shared/
    ├── widgets/            # Reusable UI components
    ├── models/             # Shared data models
    └── providers/          # Riverpod providers
```

### 2.2 State Management with Riverpod

```dart
// Example: Lesson State Provider
final lessonProvider = StateNotifierProvider<LessonNotifier, LessonState>(
  (ref) => LessonNotifier(ref.read(lessonRepositoryProvider))
);

class LessonNotifier extends StateNotifier<LessonState> {
  final LessonRepository _repository;
  
  LessonNotifier(this._repository) : super(LessonState.initial());
  
  Future<void> loadLesson(String lessonId) async {
    state = state.copyWith(isLoading: true);
    try {
      final lesson = await _repository.getLesson(lessonId);
      state = state.copyWith(lesson: lesson, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}
```

### 2.3 Feature Module Structure

Each feature follows the same pattern:

```
feature_name/
├── presentation/
│   ├── pages/              # Full-screen pages
│   ├── widgets/            # Feature-specific widgets
│   └── providers/          # Feature state providers
│
├── domain/
│   ├── entities/           # Business objects
│   ├── repositories/       # Abstract interfaces
│   └── usecases/           # Business logic
│
└── data/
    ├── models/             # JSON serializable models
    ├── datasources/        # API clients
    └── repositories/       # Repository implementations
```

### 2.4 Navigation Architecture

```dart
// Route definitions with feature flag checks
final routes = {
  '/': (context) => DashboardPage(),
  '/lesson/:id': (context) => LessonPage(),
  '/coding': (context) => CodingPlayground(),
  '/analytics': (context) => AnalyticsPage(),
  '/admin': (context) => AdminConsole(),
};

// Navigation with role-based guards
class RoleGuard extends StatelessWidget {
  final List<UserRole> allowedRoles;
  final Widget child;
  
  // Checks user role before rendering
}
```

---

## 3. Backend Architecture

### 3.1 FastAPI Application Structure

```python
app/
├── main.py                 # Application entry point
├── api/
│   ├── deps.py            # Dependency injection
│   ├── auth.py            # Auth endpoints
│   ├── lessons.py         # Lesson endpoints
│   ├── sandbox.py         # Sandbox endpoints
│   ├── analytics.py       # Analytics endpoints
│   └── admin.py           # Admin endpoints
│
├── core/
│   ├── config.py          # Configuration management
│   ├── security.py        # JWT, password hashing
│   └── middleware.py      # RBAC, feature flags
│
├── models/
│   ├── user.py            # User models
│   ├── lesson.py          # Lesson models
│   ├── progress.py        # Progress models
│   └── feature_flag.py    # Feature flag models
│
├── services/
│   ├── auth_service.py
│   ├── learning_engine.py
│   ├── ai_engine.py
│   ├── sandbox_service.py
│   ├── analytics_service.py
│   └── feature_flags.py
│
└── db/
    └── firestore.py       # Firestore client
```

### 3.2 Dependency Injection Pattern

```python
# deps.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Firestore = Depends(get_db)
) -> User:
    """Extract and validate user from JWT token"""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("sub")
    user = await db.collection("users").document(user_id).get()
    return User(**user.to_dict())

async def require_role(required_roles: List[UserRole]):
    """Dependency for role-based access control"""
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return role_checker
```

### 3.3 Service Layer Pattern

```python
# learning_engine.py
class LearningEngine:
    def __init__(self, db: Firestore, ai_engine: AIEngine):
        self.db = db
        self.ai_engine = ai_engine
    
    async def submit_solution(
        self, 
        user_id: str, 
        lesson_id: str, 
        code: str
    ) -> SubmissionResult:
        """Process code submission with adaptive logic"""
        
        # 1. Execute code in sandbox
        execution_result = await sandbox_service.execute(code)
        
        # 2. Check against test cases
        is_correct = self._validate_solution(execution_result, lesson_id)
        
        # 3. Update progress
        await self._update_progress(user_id, lesson_id, is_correct)
        
        # 4. Trigger AI adaptation if needed
        if not is_correct:
            hint = await self.ai_engine.generate_hint(
                user_id, lesson_id, code, execution_result
            )
            return SubmissionResult(correct=False, hint=hint)
        
        return SubmissionResult(correct=True)
```

---

## 4. Data Flow

### 4.1 Lesson Submission Flow

```
┌─────────┐
│ Student │
│ Submits │
│  Code   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ Frontend        │
│ - Validate      │
│ - Show loading  │
└────┬────────────┘
     │ POST /api/lessons/{id}/submit
     ▼
┌─────────────────┐
│ API Gateway     │
│ - Auth check    │
│ - Feature flags │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Learning Engine │
│ - Get lesson    │
│ - Get progress  │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Sandbox Service │
│ - Execute code  │
│ - Capture output│
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Validation      │
│ - Check tests   │
│ - Calculate     │
│   correctness   │
└────┬────────────┘
     │
     ├─── Correct ───┐
     │               ▼
     │          ┌─────────────┐
     │          │ Update      │
     │          │ Progress    │
     │          │ (Mastery++)│
     │          └─────────────┘
     │
     └─── Wrong ────┐
                    ▼
               ┌─────────────┐
               │ AI Engine   │
               │ - Analyze   │
               │ - Generate  │
               │   hint      │
               └──────┬──────┘
                      │
                      ▼
               ┌─────────────┐
               │ Update      │
               │ Progress    │
               │ (Retry++)   │
               └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │ Return      │
               │ Response    │
               └─────────────┘
```

### 4.2 Real-Time Feature Flag Update Flow

```
Admin Console
    │
    │ Toggle Feature Flag
    ▼
Backend API
    │
    │ Update Firestore
    ▼
Firestore Collection
    │
    │ Trigger Listener
    ▼
All Connected Clients
    │
    │ Receive Update
    ▼
Frontend State Update
    │
    │ Re-evaluate Features
    ▼
UI Re-render
```



---

## 5. Database Schema

### 5.1 Firestore Collections Overview

```
dharmacodex/
├── users/
├── lessons/
├── progress/
├── feature_flags/
├── analytics/
├── ai_logs/
└── submissions/
```

### 5.2 Users Collection

```json
{
  "user_id": "uuid-string",
  "email": "student@example.com",
  "password_hash": "bcrypt-hashed-password",
  "role": "student",
  "profile": {
    "name": "Student Name",
    "age": 12,
    "avatar_url": "https://...",
    "learning_mode": "guided"
  },
  "settings": {
    "screen_time_limit": 60,
    "calm_ui_mode": false,
    "ai_enabled": true
  },
  "parent_id": "uuid-of-parent",
  "teacher_ids": ["uuid-teacher-1"],
  "created_at": "2026-02-11T10:00:00Z",
  "last_login": "2026-02-11T15:30:00Z"
}
```

### 5.3 Lessons Collection

```json
{
  "lesson_id": "lesson-001",
  "title": "Introduction to Loops",
  "concept": "for_loops",
  "difficulty": 1,
  "prerequisites": [],
  "content": {
    "explanation": "Markdown content...",
    "examples": [
      {
        "code": "for i in range(5):\n    print(i)",
        "output": "0\n1\n2\n3\n4"
      }
    ],
    "practice_problem": {
      "description": "Write a loop that prints...",
      "starter_code": "# Your code here",
      "test_cases": [
        {"input": "5", "expected_output": "0 1 2 3 4"}
      ]
    }
  },
  "mastery_criteria": {
    "min_attempts": 1,
    "max_hints_used": 2,
    "time_limit_seconds": 600
  },
  "feature_flags": ["lesson_engine", "code_editor"]
}
```

### 5.4 Progress Collection

```json
{
  "progress_id": "uuid",
  "user_id": "uuid-student",
  "lesson_id": "lesson-001",
  "status": "in_progress",
  "attempts": 3,
  "hints_used": 1,
  "time_spent_seconds": 420,
  "mastery_level": 0.6,
  "started_at": "2026-02-11T14:00:00Z",
  "completed_at": null,
  "last_submission": {
    "code": "for i in range(5):\n    print(i)",
    "correct": false,
    "error": "Expected output: 0 1 2 3 4, Got: 0\\n1\\n2\\n3\\n4"
  }
}
```



### 5.5 Feature Flags Collection

```json
{
  "flag_id": "ai_hint_system",
  "name": "AI Hint System",
  "description": "Adaptive AI hints based on retry patterns",
  "enabled": true,
  "rollout_percentage": 100,
  "target_config": {
    "roles": ["student"],
    "modes": ["guided", "full"],
    "min_age": 10,
    "max_age": null
  },
  "dependencies": ["lesson_engine"],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-02-11T10:00:00Z",
  "updated_by": "admin-uuid"
}
```

### 5.6 Analytics Collection

```json
{
  "analytics_id": "uuid",
  "user_id": "uuid-student",
  "date": "2026-02-11",
  "metrics": {
    "lessons_completed": 2,
    "total_attempts": 15,
    "hints_used": 3,
    "time_spent_seconds": 3600,
    "streak_days": 7,
    "mastery_scores": {
      "loops": 0.85,
      "conditionals": 0.70,
      "functions": 0.60
    }
  },
  "weaknesses": ["recursion", "nested_loops"],
  "strengths": ["basic_loops", "variables"]
}
```

### 5.7 AI Logs Collection

```json
{
  "log_id": "uuid",
  "user_id": "uuid-student",
  "lesson_id": "lesson-001",
  "timestamp": "2026-02-11T15:30:00Z",
  "trigger": "retry_threshold",
  "hint_level": 2,
  "hint_content": "You need a for loop structure here",
  "user_code": "# student's code",
  "context": {
    "attempts": 4,
    "time_spent": 300,
    "previous_errors": ["SyntaxError", "IndentationError"]
  }
}
```

---

## 6. Feature Flag System

### 6.1 Feature Flag Architecture

```
┌─────────────────────────────────────────────────────┐
│              Feature Flag Engine                     │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Flag Evaluation Logic                     │    │
│  │  - Check enabled status                    │    │
│  │  - Validate role match                     │    │
│  │  - Validate mode match                     │    │
│  │  - Check age range                         │    │
│  │  - Calculate rollout percentage            │    │
│  │  - Verify dependencies                     │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  Real-Time Sync                            │    │
│  │  - Firestore listener                      │    │
│  │  - Push updates to clients                 │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### 6.2 Flag Evaluation Algorithm

```python
def evaluate_flag(flag: FeatureFlag, user: User) -> bool:
    """Determine if feature is enabled for user"""
    
    # 1. Check global enabled status
    if not flag.enabled:
        return False
    
    # 2. Check role match
    if user.role not in flag.target_config.roles:
        return False
    
    # 3. Check learning mode
    if user.profile.learning_mode not in flag.target_config.modes:
        return False
    
    # 4. Check age range
    if flag.target_config.min_age and user.profile.age < flag.target_config.min_age:
        return False
    if flag.target_config.max_age and user.profile.age > flag.target_config.max_age:
        return False
    
    # 5. Check rollout percentage (deterministic based on user_id)
    user_hash = hash(user.user_id) % 100
    if user_hash >= flag.rollout_percentage:
        return False
    
    # 6. Check dependencies
    for dep_flag_id in flag.dependencies:
        dep_flag = get_flag(dep_flag_id)
        if not evaluate_flag(dep_flag, user):
            return False
    
    return True
```



### 6.3 Feature Flag Workflow

```
Admin Action: Toggle Feature
    │
    ▼
Backend: Update Firestore
    │
    ▼
Firestore: Trigger onSnapshot
    │
    ▼
All Clients: Receive Update
    │
    ▼
Frontend: Re-evaluate Flags
    │
    ▼
UI: Show/Hide Features
```

---

## 7. Authentication Flow

### 7.1 Registration Flow

```
User → Frontend: Enter email, password, role
    │
    ▼
Frontend: Validate input
    │
    ▼
Backend: POST /api/auth/register
    │
    ├─→ Hash password (bcrypt)
    ├─→ Create user document in Firestore
    ├─→ Generate JWT token
    │
    ▼
Frontend: Store JWT in secure storage
    │
    ▼
Frontend: Navigate to dashboard
```

### 7.2 Login Flow

```
User → Frontend: Enter email, password
    │
    ▼
Backend: POST /api/auth/login
    │
    ├─→ Fetch user by email
    ├─→ Verify password hash
    ├─→ Generate JWT token
    │   └─→ Payload: {sub: user_id, role: role, exp: timestamp}
    │
    ▼
Frontend: Store JWT
    │
    ▼
Frontend: Fetch user profile
    │
    ▼
Frontend: Load feature flags
    │
    ▼
Frontend: Navigate to role-specific dashboard
```

### 7.3 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "role": "student",
  "email": "student@example.com",
  "iat": 1707656400,
  "exp": 1707742800
}
```

### 7.4 Protected Route Middleware

```python
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """Validate JWT on every request"""
    
    # Skip auth for public routes
    if request.url.path in PUBLIC_ROUTES:
        return await call_next(request)
    
    # Extract token
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    try:
        # Verify and decode
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        request.state.user_id = payload["sub"]
        request.state.role = payload["role"]
    except JWTError:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})
    
    return await call_next(request)
```

---

## 8. Learning Engine Workflow

### 8.1 Lesson Progression State Machine

```
┌─────────────┐
│   LOCKED    │ (Prerequisites not met)
└──────┬──────┘
       │ Prerequisites completed
       ▼
┌─────────────┐
│  UNLOCKED   │ (Available to start)
└──────┬──────┘
       │ User clicks "Start"
       ▼
┌─────────────┐
│ IN_PROGRESS │ (Actively working)
└──────┬──────┘
       │ Mastery criteria met
       ▼
┌─────────────┐
│  COMPLETED  │ (Mastered)
└─────────────┘
```

### 8.2 Mastery Calculation Algorithm

```python
def calculate_mastery(progress: Progress, lesson: Lesson) -> float:
    """Calculate mastery score (0.0 to 1.0)"""
    
    # Base score from correctness
    correctness_score = 1.0 if progress.last_submission.correct else 0.0
    
    # Penalty for excessive attempts (diminishing returns)
    attempt_penalty = min(0.3, (progress.attempts - 1) * 0.05)
    
    # Penalty for hint usage
    hint_penalty = progress.hints_used * 0.1
    
    # Bonus for speed (if completed quickly)
    time_bonus = 0.0
    if progress.time_spent_seconds < lesson.mastery_criteria.time_limit_seconds * 0.5:
        time_bonus = 0.1
    
    mastery = correctness_score - attempt_penalty - hint_penalty + time_bonus
    return max(0.0, min(1.0, mastery))
```



### 8.3 Concept Dependency Graph

```
Variables
    │
    ├─→ Conditionals
    │       │
    │       ├─→ Nested Conditionals
    │       │
    │       └─→ Boolean Logic
    │
    └─→ Loops
            │
            ├─→ Nested Loops
            │
            ├─→ Loop Control (break/continue)
            │
            └─→ Iteration Patterns
                    │
                    └─→ Recursion
```

---

## 9. AI Adaptation Workflow

### 9.1 AI Decision Tree

```
Submission Failed
    │
    ▼
Check Attempt Count
    │
    ├─→ Attempts < 3: AI Silent
    │
    └─→ Attempts >= 3
            │
            ▼
        Check Time Spent
            │
            ├─→ Time < 5 min: AI Silent
            │
            └─→ Time >= 5 min
                    │
                    ▼
                Analyze Error Pattern
                    │
                    ├─→ Syntax Error → Hint Level 1
                    ├─→ Logic Error → Hint Level 2
                    └─→ Conceptual Gap → Hint Level 3
```

### 9.2 Hint Generation Algorithm

```python
async def generate_hint(
    user_id: str,
    lesson_id: str,
    code: str,
    error: str
) -> Hint:
    """Generate contextual hint without revealing solution"""
    
    # 1. Analyze error type
    error_type = classify_error(error)
    
    # 2. Get user's attempt history
    attempts = await get_attempts(user_id, lesson_id)
    
    # 3. Determine hint level
    hint_level = min(3, len(attempts) - 2)
    
    # 4. Generate hint based on level and error
    if hint_level == 1:
        # Conceptual reminder
        hint = get_concept_reminder(lesson_id)
    elif hint_level == 2:
        # Structural guidance
        hint = get_structural_hint(error_type, code)
    else:
        # Pseudo-code hint
        hint = get_pseudocode_hint(lesson_id, error_type)
    
    # 5. Log AI decision
    await log_ai_decision(user_id, lesson_id, hint_level, hint)
    
    return hint
```

### 9.3 Weakness Detection

```python
def detect_weaknesses(user_id: str) -> List[str]:
    """Identify concepts user struggles with"""
    
    # Get all progress records
    progress_records = get_user_progress(user_id)
    
    weaknesses = []
    
    for concept in ALL_CONCEPTS:
        # Get lessons for this concept
        concept_lessons = [p for p in progress_records if p.lesson.concept == concept]
        
        if not concept_lessons:
            continue
        
        # Calculate average attempts and mastery
        avg_attempts = mean([p.attempts for p in concept_lessons])
        avg_mastery = mean([p.mastery_level for p in concept_lessons])
        
        # Flag as weakness if high attempts or low mastery
        if avg_attempts > 5 or avg_mastery < 0.6:
            weaknesses.append(concept)
    
    return weaknesses
```

---

## 10. Coding Sandbox Architecture

### 10.1 Sandbox Execution Flow

```
Code Submission
    │
    ▼
Backend: Validate Syntax
    │
    ├─→ Invalid: Return Error
    │
    └─→ Valid
            │
            ▼
        Blacklist Check
            │
            ├─→ Dangerous: Reject
            │
            └─→ Safe
                    │
                    ▼
                Docker API: Create Container
                    │
                    ├─→ Set resource limits
                    ├─→ Mount code as volume
                    ├─→ Disable network
                    │
                    ▼
                Execute Code
                    │
                    ├─→ Capture stdout
                    ├─→ Capture stderr
                    ├─→ Monitor timeout
                    │
                    ▼
                Destroy Container
                    │
                    ▼
                Return Results
```

### 10.2 Docker Container Configuration

```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN useradd -m -u 1000 sandbox

# Set resource limits (enforced by Docker API)
# Memory: 128MB
# CPU: 0.5 core
# Time: 2 seconds

# Disable network
# --network none

# Read-only filesystem
# --read-only

# Drop all capabilities
# --cap-drop ALL

WORKDIR /sandbox
USER sandbox

CMD ["python", "code.py"]
```

### 10.3 Security Validation

```python
BLACKLISTED_IMPORTS = [
    "os", "sys", "subprocess", "socket", 
    "requests", "urllib", "http", "ftplib",
    "__import__", "eval", "exec", "compile"
]

def validate_code(code: str) -> ValidationResult:
    """Check code for security issues"""
    
    # 1. Parse AST
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return ValidationResult(valid=False, error=str(e))
    
    # 2. Check for blacklisted imports
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name in BLACKLISTED_IMPORTS:
                    return ValidationResult(
                        valid=False, 
                        error=f"Import '{alias.name}' not allowed"
                    )
    
    # 3. Check for dangerous functions
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in ["eval", "exec", "compile"]:
                    return ValidationResult(
                        valid=False,
                        error=f"Function '{node.func.id}' not allowed"
                    )
    
    return ValidationResult(valid=True)
```



### 10.4 Execution Monitoring

```python
async def execute_code(code: str, test_cases: List[TestCase]) -> ExecutionResult:
    """Execute code with monitoring"""
    
    client = docker.from_env()
    
    results = []
    
    for test_case in test_cases:
        try:
            # Create container with limits
            container = client.containers.run(
                image="dharmacodex-sandbox:latest",
                command=["python", "-c", code],
                stdin_open=True,
                detach=True,
                mem_limit="128m",
                cpu_quota=50000,  # 0.5 core
                network_disabled=True,
                read_only=True,
                remove=True
            )
            
            # Send input
            container.attach_socket(params={'stdin': 1, 'stream': 1})
            container.put_archive("/sandbox", test_case.input)
            
            # Wait with timeout
            exit_code = container.wait(timeout=2)
            
            # Get output
            stdout = container.logs(stdout=True, stderr=False).decode()
            stderr = container.logs(stdout=False, stderr=True).decode()
            
            results.append(TestResult(
                input=test_case.input,
                expected=test_case.expected_output,
                actual=stdout.strip(),
                passed=(stdout.strip() == test_case.expected_output),
                error=stderr if stderr else None
            ))
            
        except docker.errors.ContainerError as e:
            results.append(TestResult(
                input=test_case.input,
                expected=test_case.expected_output,
                actual=None,
                passed=False,
                error=f"Runtime error: {str(e)}"
            ))
        except TimeoutError:
            results.append(TestResult(
                input=test_case.input,
                expected=test_case.expected_output,
                actual=None,
                passed=False,
                error="Execution timeout (infinite loop?)"
            ))
    
    return ExecutionResult(
        test_results=results,
        all_passed=all(r.passed for r in results)
    )
```

---

## 11. Analytics Engine Design

### 11.1 Analytics Data Pipeline

```
User Actions
    │
    ▼
Event Tracking
    │
    ├─→ Lesson Started
    ├─→ Code Submitted
    ├─→ Hint Requested
    ├─→ Lesson Completed
    │
    ▼
Firestore: Raw Events
    │
    ▼
Aggregation Service (Daily)
    │
    ├─→ Calculate daily metrics
    ├─→ Update mastery heatmap
    ├─→ Detect weaknesses
    ├─→ Calculate streaks
    │
    ▼
Firestore: Analytics Collection
    │
    ▼
Dashboard Queries
```

### 11.2 Mastery Heatmap Generation

```python
def generate_mastery_heatmap(user_id: str) -> MasteryHeatmap:
    """Create visual heatmap of concept mastery"""
    
    progress_records = get_user_progress(user_id)
    
    heatmap = {}
    
    for concept in ALL_CONCEPTS:
        concept_progress = [
            p for p in progress_records 
            if p.lesson.concept == concept
        ]
        
        if not concept_progress:
            heatmap[concept] = {
                "mastery": 0.0,
                "status": "not_started",
                "color": "#gray"
            }
        else:
            avg_mastery = mean([p.mastery_level for p in concept_progress])
            heatmap[concept] = {
                "mastery": avg_mastery,
                "status": get_status(avg_mastery),
                "color": get_color(avg_mastery)
            }
    
    return MasteryHeatmap(data=heatmap)

def get_color(mastery: float) -> str:
    """Map mastery to color"""
    if mastery >= 0.9:
        return "#00ff00"  # Green
    elif mastery >= 0.7:
        return "#ffff00"  # Yellow
    elif mastery >= 0.5:
        return "#ff9900"  # Orange
    else:
        return "#ff0000"  # Red
```

### 11.3 Streak Calculation

```python
def calculate_streak(user_id: str) -> int:
    """Calculate consecutive days of activity"""
    
    analytics = get_user_analytics(user_id, days=365)
    
    streak = 0
    today = datetime.now().date()
    
    for i in range(365):
        check_date = today - timedelta(days=i)
        day_analytics = next(
            (a for a in analytics if a.date == check_date), 
            None
        )
        
        if day_analytics and day_analytics.metrics.lessons_completed > 0:
            streak += 1
        else:
            break
    
    return streak
```

---

## 12. Role-Based Workflows

### 12.1 Student Workflow

```
Login
    │
    ▼
Dashboard
    │
    ├─→ View Mastery Heatmap
    ├─→ Check Streak
    ├─→ See Available Lessons
    │
    ▼
Select Lesson
    │
    ▼
Read Concept
    │
    ▼
Practice Problem
    │
    ├─→ Write Code
    ├─→ Submit
    ├─→ Get Feedback
    ├─→ Retry if needed
    │
    ▼
Reflection Pause
    │
    ▼
Lesson Complete
    │
    ▼
Next Lesson Unlocked
```

### 12.2 Parent Workflow

```
Login
    │
    ▼
Parent Dashboard
    │
    ├─→ View Child Progress
    ├─→ Check Screen Time
    ├─→ Review AI Interactions
    │
    ▼
Set Controls
    │
    ├─→ Screen Time Limit
    ├─→ Learning Mode
    ├─→ AI Settings
    │
    ▼
Export Report (PDF)
```

### 12.3 Teacher Workflow

```
Login
    │
    ▼
Teacher Dashboard
    │
    ├─→ View Cohort Analytics
    ├─→ Identify Struggling Students
    ├─→ Review Class Mastery Heatmap
    │
    ▼
Intervention
    │
    ├─→ Assign Targeted Lessons
    ├─→ Provide Feedback
    ├─→ Adjust Learning Paths
    │
    ▼
Track Progress
```

### 12.4 Admin Workflow

```
Login
    │
    ▼
Admin Console
    │
    ├─→ Feature Flag Management
    ├─→ System Analytics
    ├─→ User Management
    │
    ▼
Toggle Feature
    │
    ├─→ Set Rollout %
    ├─→ Define Target Audience
    ├─→ Enable/Disable
    │
    ▼
Monitor Impact
    │
    ├─→ Check Error Rates
    ├─→ Review User Feedback
    │
    ▼
Rollback if Needed
```



---

## 13. Complete Feature Specification

### 13.1 Module A: Core Foundation (Features 1-10)

| # | Feature Name | Description | Inputs | Outputs | Dependencies | Flag ID |
|---|--------------|-------------|--------|---------|--------------|---------|
| 1 | JWT Authentication System | Secure login with token-based auth | Email, password | JWT token | None | `auth_system` |
| 2 | Role-Based Access Control | Control access by user role | User role, route | Allow/Deny | Feature 1 | `rbac` |
| 3 | Feature-Flag Engine | Dynamic feature toggling | Flag ID, user context | Enabled/Disabled | None | `feature_flags` |
| 4 | Lite/Guided/Full Modes | Three learning experience levels | User preference | UI configuration | Feature 3 | `learning_modes` |
| 5 | Student Dashboard | Main student interface | User ID | Dashboard data | Features 1,2 | `student_dashboard` |
| 6 | Lesson Engine | Structured learning flow | Lesson ID | Lesson content | Feature 5 | `lesson_engine` |
| 7 | Mastery Gating Logic | Lock lessons until mastery | Progress data | Unlock status | Feature 6 | `mastery_gating` |
| 8 | Retry-Based Progression | Unlimited attempts without penalty | Submission | Updated progress | Feature 6 | `retry_progression` |
| 9 | Progress Tracking System | Store and retrieve progress | User ID, lesson ID | Progress object | Feature 6 | `progress_tracking` |
| 10 | Legendary Themed UI | Mythological design system | Theme config | Styled components | None | `legendary_ui` |

### 13.2 Module B: Coding Engine (Features 11-20)

| # | Feature Name | Description | Inputs | Outputs | Dependencies | Flag ID |
|---|--------------|-------------|--------|---------|--------------|---------|
| 11 | Code Editor | Syntax-highlighted editor | Code text | Formatted display | Feature 6 | `code_editor` |
| 12 | Secure Sandbox Execution | Docker-isolated code running | Code, test cases | Execution results | Feature 11 | `sandbox_execution` |
| 13 | Step-by-Step Debugger | Line-by-line execution | Code, breakpoints | Execution state | Feature 12 | `debugger` |
| 14 | Error Explanation Engine | Human-readable error messages | Error object | Explanation text | Feature 12 | `error_explainer` |
| 15 | Output Console | Display execution output | Stdout, stderr | Console UI | Feature 12 | `output_console` |
| 16 | Infinite Loop Detector | Timeout-based detection | Execution time | Warning/Error | Feature 12 | `loop_detector` |
| 17 | Recursion Tree Visualizer | Animated recursion depth | Function calls | Tree diagram | Feature 13 | `recursion_viz` |
| 18 | Loop Animator | Visual cycle demonstration | Loop code | Animation | Feature 13 | `loop_animator` |
| 19 | Algorithm Comparison View | Time complexity comparison | Multiple algorithms | Comparison chart | Feature 12 | `algo_comparison` |
| 20 | Code-to-Flowchart Converter | Logic block visualization | Code AST | Flowchart SVG | Feature 11 | `flowchart_converter` |

### 13.3 Module C: AI Personalization (Features 21-30)

| # | Feature Name | Description | Inputs | Outputs | Dependencies | Flag ID |
|---|--------------|-------------|--------|---------|--------------|---------|
| 21 | Adaptive Difficulty Engine | Adjust challenge level | User performance | Difficulty level | Feature 9 | `adaptive_difficulty` |
| 22 | Weakness Detection Engine | Identify struggling concepts | Progress history | Weakness list | Feature 9 | `weakness_detection` |
| 23 | Retry Frequency Analyzer | Track repeated attempts | Attempt data | Retry patterns | Feature 8 | `retry_analyzer` |
| 24 | Layered Hint System | Progressive hint levels | Attempt count, error | Hint text | Feature 22 | `layered_hints` |
| 25 | AI Silence Mode | AI disabled until threshold | Attempt count, time | AI active/silent | Feature 24 | `ai_silence` |
| 26 | Frustration Detection Logic | Detect rapid failures | Attempt timing | Frustration flag | Feature 23 | `frustration_detect` |
| 27 | Concept Retention Predictor | Estimate memory decay | Time since completion | Retention score | Feature 9 | `retention_predictor` |
| 28 | AI Transparency Panel | Display AI reasoning | AI decisions | Explanation UI | Feature 24 | `ai_transparency` |
| 29 | Confidence Index Tracker | Track hesitation vs stability | Submission patterns | Confidence score | Feature 9 | `confidence_tracker` |
| 30 | Adaptive Revision Suggestion | Suggest practice before progress | Retention score | Revision prompt | Feature 27 | `adaptive_revision` |

### 13.4 Module D: Gurukul Pedagogy (Features 31-40)

| # | Feature Name | Description | Inputs | Outputs | Dependencies | Flag ID |
|---|--------------|-------------|--------|---------|--------------|---------|
| 31 | Reflection Pause System | Force explanation before submit | User explanation | Validation | Feature 6 | `reflection_pause` |
| 32 | Think-Before-Submit Lock | Minimum thinking time | Time spent | Submit enabled | Feature 6 | `think_lock` |
| 33 | Mentor Guidance Hints | Guidance without answers | Context | Mentor message | Feature 24 | `mentor_hints` |
| 34 | Deep Focus Mode | Distraction-free UI | User toggle | Minimal UI | Feature 10 | `focus_mode` |
| 35 | Discipline Streak Tracker | Daily learning consistency | Login dates | Streak count | Feature 9 | `streak_tracker` |
| 36 | Calm UI Mode | Reduced animation | User preference | Calm theme | Feature 10 | `calm_ui` |
| 37 | Concept Dependency Graph | Visual learning path | Concept data | Graph visualization | Feature 6 | `dependency_graph` |
| 38 | Wisdom Summary Screen | End-of-lesson recap | Lesson content | Summary UI | Feature 6 | `wisdom_summary` |
| 39 | Retry Heatmap | Visual retry density | Retry data | Heatmap UI | Feature 23 | `retry_heatmap` |
| 40 | Legendary Completion Animation | Achievement animation | Completion event | Animation | Feature 10 | `completion_anim` |

### 13.5 Module E: Analytics & Governance (Features 41-50)

| # | Feature Name | Description | Inputs | Outputs | Dependencies | Flag ID |
|---|--------------|-------------|--------|---------|--------------|---------|
| 41 | Parent Dashboard | Progress + screen time view | Child user ID | Dashboard UI | Feature 2 | `parent_dashboard` |
| 42 | Screen Time Control | Session limits | Time limit config | Enforcement | Feature 41 | `screen_time_control` |
| 43 | Teacher Cohort Analytics | Class performance heatmap | Student IDs | Analytics UI | Feature 2 | `teacher_analytics` |
| 44 | Student Mastery Heatmap | Concept-based progress grid | User progress | Heatmap UI | Feature 9 | `mastery_heatmap` |
| 45 | Admin Feature Flag Console | Toggle features live | Flag updates | Updated flags | Feature 3 | `admin_console` |
| 46 | Real-Time Feature Toggle | Immediate rollout change | Flag state | Live update | Feature 45 | `realtime_toggle` |
| 47 | Instant Rollback Mechanism | Disable features instantly | Rollback command | Disabled flag | Feature 46 | `instant_rollback` |
| 48 | Progress Export (PDF) | Downloadable report | User ID, date range | PDF file | Feature 9 | `progress_export` |
| 49 | Learning Timeline View | Visual session history | User activity | Timeline UI | Feature 9 | `timeline_view` |
| 50 | AI Decision Log Viewer | Full AI adaptation history | User ID | Log entries | Feature 28 | `ai_log_viewer` |



---

## 14. UI/UX Design System

### 14.1 Legendary Mythological Theme

#### Color Palette

```
Primary Colors:
- Divine Gold: #FFD700 (Accent, highlights)
- Sacred Saffron: #FF9933 (Primary actions)
- Mystic Purple: #6A0DAD (Secondary elements)
- Cosmic Blue: #1E3A8A (Backgrounds)

Semantic Colors:
- Success Green: #10B981 (Correct answers, mastery)
- Warning Amber: #F59E0B (Hints, caution)
- Error Crimson: #EF4444 (Errors, failures)
- Neutral Slate: #64748B (Text, borders)

Gradient Backgrounds:
- Sunrise: Linear gradient from #FF9933 to #FFD700
- Twilight: Linear gradient from #1E3A8A to #6A0DAD
- Celestial: Radial gradient from #6A0DAD to #1E3A8A
```

#### Typography

```
Headings:
- Font: "Cinzel" (Serif, classical feel)
- Weights: 600 (Semibold), 700 (Bold)
- Sizes: H1 (32px), H2 (24px), H3 (20px)

Body Text:
- Font: "Inter" (Sans-serif, readable)
- Weight: 400 (Regular), 500 (Medium)
- Size: 16px (base), 14px (small)

Code:
- Font: "Fira Code" (Monospace with ligatures)
- Weight: 400
- Size: 14px
```

#### Animation Philosophy

```
Principles:
1. Purposeful: Every animation serves a function
2. Smooth: 60fps minimum, hardware-accelerated
3. Respectful: Can be disabled in Calm UI Mode
4. Legendary: Inspired by mythological grandeur

Timing Functions:
- Ease-in-out: Standard transitions (300ms)
- Spring: Interactive elements (stiffness: 200, damping: 20)
- Bounce: Celebration animations (duration: 800ms)

Key Animations:
- Page transitions: Fade + slide (400ms)
- Button press: Scale down to 0.95 (100ms)
- Completion: Particle burst + glow (2000ms)
- Hint reveal: Fade in + slide up (500ms)
```

### 14.2 Component Library

#### Button Variants

```dart
// Primary Button (Sacred Saffron)
ElevatedButton(
  style: ElevatedButton.styleFrom(
    backgroundColor: Color(0xFFFF9933),
    foregroundColor: Colors.white,
    elevation: 4,
    shadowColor: Color(0xFFFF9933).withOpacity(0.5),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  child: Text('Submit'),
)

// Secondary Button (Mystic Purple)
OutlinedButton(
  style: OutlinedButton.styleFrom(
    foregroundColor: Color(0xFF6A0DAD),
    side: BorderSide(color: Color(0xFF6A0DAD), width: 2),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  child: Text('Get Hint'),
)
```

#### Card Design

```dart
Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [Color(0xFF1E3A8A), Color(0xFF6A0DAD)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: Color(0xFF6A0DAD).withOpacity(0.3),
        blurRadius: 20,
        offset: Offset(0, 10),
      ),
    ],
  ),
  child: Padding(
    padding: EdgeInsets.all(24),
    child: LessonContent(),
  ),
)
```

### 14.3 Responsive Layout

```
Breakpoints:
- Mobile: < 640px (Single column)
- Tablet: 640px - 1024px (Two columns)
- Desktop: > 1024px (Three columns + sidebar)

Layout Strategy:
- Mobile: Stack vertically, full-width cards
- Tablet: Grid layout, 2 columns
- Desktop: Sidebar navigation + main content + analytics panel
```

### 14.4 Accessibility Compliance

```
WCAG 2.1 Level AA Standards:
- Color contrast ratio: Minimum 4.5:1 for text
- Keyboard navigation: All interactive elements accessible
- Screen reader support: Semantic HTML, ARIA labels
- Focus indicators: Visible 2px outline on focus
- Text scaling: Supports up to 200% zoom
- Alternative text: All images have descriptive alt text
```

---

## 15. Security Design

### 15.1 Authentication Security

#### Password Security
```python
# Bcrypt hashing with salt rounds
PASSWORD_SALT_ROUNDS = 12

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt(PASSWORD_SALT_ROUNDS)
    ).decode('utf-8')

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode('utf-8'), 
        hash.encode('utf-8')
    )
```

#### JWT Security
```python
# Token configuration
JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET")  # 256-bit random key
JWT_EXPIRATION_HOURS = 24

# Token generation
def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
```

### 15.2 Role-Based Access Control

```python
# Role hierarchy
class UserRole(Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"

# Permission matrix
PERMISSIONS = {
    UserRole.STUDENT: [
        "read:lessons",
        "write:submissions",
        "read:own_progress"
    ],
    UserRole.PARENT: [
        "read:child_progress",
        "write:child_settings",
        "read:ai_logs"
    ],
    UserRole.TEACHER: [
        "read:cohort_analytics",
        "write:assignments",
        "read:student_progress"
    ],
    UserRole.ADMIN: [
        "read:all",
        "write:all",
        "manage:feature_flags"
    ]
}

# Permission check decorator
def require_permission(permission: str):
    def decorator(func):
        async def wrapper(user: User = Depends(get_current_user), *args, **kwargs):
            if permission not in PERMISSIONS[user.role]:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return await func(user, *args, **kwargs)
        return wrapper
    return decorator
```

### 15.3 Sandbox Isolation

```
Security Layers:

1. Container Isolation
   - Separate namespace
   - No shared resources
   - Ephemeral (destroyed after use)

2. Resource Limits
   - Memory: 128MB hard limit
   - CPU: 0.5 core quota
   - Time: 2 second timeout
   - Disk: Read-only filesystem

3. Network Isolation
   - No internet access
   - No localhost access
   - No inter-container communication

4. Capability Dropping
   - Drop all Linux capabilities
   - No privileged operations
   - No device access

5. Code Validation
   - AST analysis before execution
   - Blacklist dangerous imports
   - Syntax validation
```

### 15.4 Data Protection

```
Encryption:
- Data in transit: TLS 1.3
- Data at rest: Firestore encryption (AES-256)
- Sensitive fields: Additional application-level encryption

Privacy:
- PII minimization: Collect only necessary data
- Data retention: 2 years for inactive accounts
- Right to deletion: User-initiated account deletion
- Parental consent: Required for users under 13

Compliance:
- COPPA: Children's Online Privacy Protection Act
- GDPR: General Data Protection Regulation (EU)
- FERPA: Family Educational Rights and Privacy Act
```

### 15.5 AI Guardrails

```python
class AIGuardrail:
    """Prevent AI from revealing solutions"""
    
    FORBIDDEN_PATTERNS = [
        r"def\s+\w+\s*\([^)]*\):",  # Function definitions
        r"for\s+\w+\s+in\s+range\([^)]+\):",  # Complete loop syntax
        r"if\s+.+:\s*\n\s+.+",  # Complete if statements
    ]
    
    def validate_hint(self, hint: str, lesson: Lesson) -> bool:
        """Ensure hint doesn't contain solution code"""
        
        # Check for forbidden patterns
        for pattern in self.FORBIDDEN_PATTERNS:
            if re.search(pattern, hint):
                return False
        
        # Check for solution code similarity
        solution = lesson.solution_code
        similarity = self._calculate_similarity(hint, solution)
        if similarity > 0.7:  # More than 70% similar
            return False
        
        return True
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using difflib"""
        return difflib.SequenceMatcher(None, text1, text2).ratio()
```



---

## 16. Scalability & Expansion

### 16.1 Current Architecture Scalability

```
Component          Current Capacity    Bottleneck         Scaling Strategy
-----------------------------------------------------------------------------
Frontend           Unlimited           Client device      Progressive Web App
API Gateway        1000 req/s          Single instance    Horizontal scaling
Learning Engine    500 concurrent      CPU-bound          Microservice split
Sandbox            100 concurrent      Docker daemon      Kubernetes pods
Firestore          10K writes/s        Cost               Caching layer
AI Engine          200 req/s           Algorithm          GPU acceleration
```

### 16.2 Horizontal Scaling Plan

```
Phase 1: Monolith (Current)
┌─────────────────────────┐
│   FastAPI Application   │
│  (All services bundled) │
└─────────────────────────┘

Phase 2: Service Separation
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │ Learning │  │ Sandbox  │
│ Service  │  │  Engine  │  │ Service  │
└──────────┘  └──────────┘  └──────────┘

Phase 3: Microservices + Load Balancer
                ┌──────────────┐
                │Load Balancer │
                └──────┬───────┘
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼───┐    ┌───▼────┐   ┌───▼────┐
    │ Auth   │    │Learning│   │Sandbox │
    │Service │    │Engine  │   │Service │
    │(x3)    │    │(x5)    │   │(x10)   │
    └────────┘    └────────┘   └────────┘

Phase 4: Kubernetes Orchestration
┌─────────────────────────────────────────┐
│         Kubernetes Cluster              │
│  ┌────────────────────────────────┐    │
│  │  Ingress Controller            │    │
│  └────────────────────────────────┘    │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │  Auth  │  │Learning│  │Sandbox │   │
│  │  Pods  │  │  Pods  │  │  Pods  │   │
│  │ (Auto  │  │ (Auto  │  │ (Auto  │   │
│  │ Scale) │  │ Scale) │  │ Scale) │   │
│  └────────┘  └────────┘  └────────┘   │
└─────────────────────────────────────────┘
```

### 16.3 Caching Strategy

```python
# Redis caching layer
class CacheService:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379)
    
    async def get_lesson(self, lesson_id: str) -> Optional[Lesson]:
        """Get lesson from cache or database"""
        
        # Try cache first
        cached = self.redis.get(f"lesson:{lesson_id}")
        if cached:
            return Lesson.parse_raw(cached)
        
        # Fetch from database
        lesson = await db.collection("lessons").document(lesson_id).get()
        
        # Cache for 1 hour
        self.redis.setex(
            f"lesson:{lesson_id}",
            3600,
            lesson.json()
        )
        
        return lesson
```

### 16.4 Database Optimization

```
Current: Single Firestore instance

Optimization Strategies:
1. Indexing: Create composite indexes for common queries
2. Denormalization: Duplicate frequently accessed data
3. Sharding: Partition by user_id for large collections
4. Read replicas: Separate read/write paths
5. Caching: Redis for hot data (lessons, feature flags)

Example Index:
Collection: progress
Fields: [user_id, lesson_id, status]
Query: Get all in-progress lessons for user
```

### 16.5 CDN Integration

```
Static Assets Distribution:
- Frontend bundle: CloudFlare CDN
- Images/animations: AWS CloudFront
- Code editor assets: jsDelivr

Benefits:
- Reduced latency (edge locations)
- Lower bandwidth costs
- DDoS protection
- Automatic compression
```

### 16.6 Monitoring & Observability

```python
# Prometheus metrics
from prometheus_client import Counter, Histogram

# Request metrics
request_count = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

# Sandbox metrics
sandbox_executions = Counter(
    'sandbox_executions_total',
    'Total sandbox executions',
    ['language', 'status']
)

sandbox_duration = Histogram(
    'sandbox_execution_duration_seconds',
    'Sandbox execution duration'
)

# AI metrics
ai_hints_generated = Counter(
    'ai_hints_total',
    'Total AI hints generated',
    ['hint_level']
)
```

### 16.7 Disaster Recovery

```
Backup Strategy:
- Firestore: Daily automated backups (7-day retention)
- Code: Git repository with multiple remotes
- Secrets: Encrypted vault (HashiCorp Vault)

Recovery Plan:
1. Detect failure (monitoring alerts)
2. Switch to backup region (DNS failover)
3. Restore from latest backup
4. Verify data integrity
5. Resume normal operations

RTO (Recovery Time Objective): 1 hour
RPO (Recovery Point Objective): 24 hours
```

---

## 17. Deployment Blueprint

### 17.1 Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - FIREBASE_EMULATOR=true
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --reload --host 0.0.0.0

  sandbox:
    build: ./sandbox
    privileged: true
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  firebase-emulator:
    image: google/cloud-sdk:latest
    ports:
      - "8080:8080"  # Firestore
      - "9099:9099"  # Auth
    command: gcloud emulators firestore start --host-port=0.0.0.0:8080
```

### 17.2 Production Deployment

```yaml
# kubernetes/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dharmacodex-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dharmacodex-backend
  template:
    metadata:
      labels:
        app: dharmacodex-backend
    spec:
      containers:
      - name: backend
        image: dharmacodex/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: dharmacodex-secrets
              key: jwt-secret
        - name: FIREBASE_CREDENTIALS
          valueFrom:
            secretKeyRef:
              name: dharmacodex-secrets
              key: firebase-creds
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: dharmacodex-backend-service
spec:
  selector:
    app: dharmacodex-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

### 17.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy DharmaCodex

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/
      
      - name: Run Frontend Tests
        run: |
          cd frontend
          flutter test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend Image
        run: |
          docker build -t dharmacodex/backend:${{ github.sha }} ./backend
          docker tag dharmacodex/backend:${{ github.sha }} dharmacodex/backend:latest
      
      - name: Build Sandbox Image
        run: |
          docker build -t dharmacodex/sandbox:${{ github.sha }} ./sandbox
          docker tag dharmacodex/sandbox:${{ github.sha }} dharmacodex/sandbox:latest
      
      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push dharmacodex/backend:latest
          docker push dharmacodex/sandbox:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/dharmacodex-backend backend=dharmacodex/backend:${{ github.sha }}
          kubectl rollout status deployment/dharmacodex-backend
```

### 17.4 Environment Configuration

```bash
# Production .env
JWT_SECRET=<256-bit-random-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

FIREBASE_PROJECT_ID=dharmacodex-prod
FIREBASE_CREDENTIALS_PATH=/secrets/firebase-creds.json

DOCKER_SANDBOX_IMAGE=dharmacodex/sandbox:latest
SANDBOX_TIMEOUT_SECONDS=2
SANDBOX_MEMORY_LIMIT=128m

REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379

API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://dharmacodex.com,https://app.dharmacodex.com

SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=INFO
```

### 17.5 Monitoring Setup

```yaml
# prometheus/config.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dharmacodex-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'

  - job_name: 'dharmacodex-sandbox'
    static_configs:
      - targets: ['sandbox:9000']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts.yml'
```

```yaml
# prometheus/alerts.yml
groups:
  - name: dharmacodex
    rules:
      - alert: HighErrorRate
        expr: rate(api_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
      
      - alert: SlowSandboxExecution
        expr: histogram_quantile(0.95, sandbox_execution_duration_seconds) > 1.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Sandbox execution is slow"
```

---

## 18. Conclusion

DharmaCodex represents a paradigm shift in programming education — from competitive, speed-focused platforms to a nurturing, mastery-oriented digital Gurukul. This design document outlines a comprehensive, scalable, and secure architecture that embodies the principles of disciplined learning, adaptive intelligence, and child-safe technology.

The 50-feature hackathon implementation serves as a solid foundation for expansion to 500+ features, with modular architecture, feature-flag governance, and cloud-native deployment strategies ensuring sustainable growth.

**Key Architectural Strengths:**
- Clean separation of concerns across all layers
- Feature-flag driven development for safe rollouts
- AI guardrails preventing solution revelation
- Sandbox isolation ensuring security
- Role-based workflows supporting all stakeholders
- Scalable infrastructure ready for millions of users

**Next Steps:**
1. Complete hackathon implementation of all 50 features
2. Conduct user testing with students, parents, and teachers
3. Iterate based on feedback
4. Plan Phase 2 expansion (100 features)
5. Establish partnerships with schools and educational institutions

---

**Document Version**: 1.0  
**Last Updated**: February 11, 2026  
**Maintained By**: DharmaCodex Core Team

**Built with 🕉️ for the next generation of logical thinkers.**
