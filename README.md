# 🏗️ Hexagonal Architecture Guide

## 📋 Table of Contents
- [What is Hexagonal Architecture?](#what-is-hexagonal-architecture)
- [Core Principles](#core-principles)
- [Architecture Layers](#architecture-layers)
- [Benefits](#benefits)
- [Key Concepts](#key-concepts)
- [When to Use It](#when-to-use-it)

## What is Hexagonal Architecture?

**Hexagonal Architecture** (also known as **Ports and Adapters**) is an architectural pattern that isolates business logic from external dependencies. It creates a clear separation between what your application does (domain logic) and how it does it (infrastructure).

### The Big Picture

Think of your application as a hexagon where:
- **The center** contains your core business logic
- **The edges** are interfaces (ports) that define contracts
- **Outside** are implementations (adapters) that connect to the real world

```
        ┌─────────────────┐
    ┌───┤   Adapters      │ (HTTP, DB, UI)
    │   └─────────────────┘
    │           │
    ▼           ▼
┌────────────────────┐
│   Ports (Interfaces)|
└────────────────────┘
           │
           ▼
    ┌──────────┐
    │  Domain  │ (Business Logic)
    └──────────┘
```

## Core Principles

### 1. **Domain-Centric Design**
The business logic is at the center and doesn't depend on anything external. It defines its own rules and entities.

### 2. **Dependency Inversion**
Dependencies flow inward. External layers depend on inner layers, never the opposite.

```
Infrastructure → Application → Domain
     ✅              ✅          ✅

Domain → Infrastructure
  ❌
```

### 3. **Technology Agnostic**
Your core business logic doesn't know about:
- HTTP or REST APIs
- Databases or ORMs
- UI frameworks
- External services

### 4. **Explicit Contracts**
All interactions with the outside world happen through well-defined interfaces (ports).

## Architecture Layers

The application is organized in concentric layers, each with a specific responsibility:

```
┌─────────────────────────────────────────┐
│         🎨 PRESENTATION                 │  ← UI Components
│  (Angular, React, CLI, etc.)            │
└─────────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────────┐
│      📦 APPLICATION                     │  ← Use Cases
│  (Business workflows)                   │
└─────────────────────────────────────────┘
              ↓ uses
┌─────────────────────────────────────────┐
│       🎯 DOMAIN                         │  ← Business Logic
│  (Entities, Rules, Ports)               │
└─────────────────────────────────────────┘
              ↑ implements
┌─────────────────────────────────────────┐
│    🔌 INFRASTRUCTURE                    │  ← Adapters
│  (HTTP, DB, Files, APIs)                │
└─────────────────────────────────────────┘
```

### 1️⃣ **Domain Layer** 🎯

**Purpose**: Contains the pure business logic and domain concepts.

**Responsibilities**:
- Define business entities (models)
- Define business rules and validations
- Define contracts (ports/interfaces) for external interactions
- No dependencies on frameworks or libraries

**Key Characteristics**:
- Pure TypeScript/JavaScript classes
- No framework decorators
- Framework-agnostic
- Highly testable

### 2️⃣ **Application Layer** 📦

**Purpose**: Orchestrates business workflows using domain entities.

**Responsibilities**:
- Implement use cases (user stories)
- Coordinate domain entities
- Apply business validations
- Handle application-specific logic

**Key Characteristics**:
- Uses domain models and ports
- Independent of UI and infrastructure
- Each use case represents one business operation
- Easy to test with mocked ports

### 3️⃣ **Infrastructure Layer** 🔌

**Purpose**: Provides concrete implementations for domain ports.

**Responsibilities**:
- Implement adapters for external systems (HTTP, databases, files)
- Handle technical details (serialization, protocols, formats)
- Transform external data to domain models
- Connect to third-party services

**Key Characteristics**:
- Implements domain interfaces
- Uses specific technologies and frameworks
- Can be easily replaced or mocked
- Isolated from business logic

### 4️⃣ **Presentation Layer** 🎨

**Purpose**: Handles user interaction and displays information.

**Responsibilities**:
- Render UI components
- Handle user input
- Call use cases
- Display results to users

**Key Characteristics**:
- Depends on application layer (use cases)
- Injects ports, not concrete implementations
- No direct knowledge of infrastructure
- Framework-specific (Angular, React, etc.)

## Key Concepts

### Ports (Interfaces)

Ports are **contracts** that define how the domain interacts with the outside world without knowing implementation details.

**Example**: A storage port doesn't care if data is stored in localStorage, sessionStorage, or a database.

### Adapters (Implementations)

Adapters are **concrete implementations** of ports. They connect your application to real-world technologies.

**Example**: An HTTP adapter implements a repository port using REST API calls.

### Use Cases

Use cases represent **business operations** or user stories. They orchestrate domain logic to accomplish specific goals.

**Example**: "Create Collection", "Login User", "Delete Document"

### Dependency Injection

A configuration layer binds ports to adapters. This allows:
- Switching implementations without changing code
- Using mocks for testing
- Supporting multiple environments (dev, prod, test)

**Example**: 
```
Development  → LocalStorageAdapter
Production   → CloudStorageAdapter
Testing      → MockStorageAdapter
```

## Benefits

### 1. **Testability** 🧪

Each layer can be tested in isolation:
- Domain logic tested without infrastructure
- Use cases tested with mocked ports
- Adapters tested independently
- Fast, reliable unit tests

### 2. **Maintainability** 🔧

Changes are localized and don't ripple through the codebase:
- Change HTTP to WebSockets → Update only the adapter
- Switch from REST to GraphQL → Update only the adapter
- Business logic remains untouched

### 3. **Flexibility** 🔄

Easily swap implementations:
- Different adapters for different environments
- Multiple implementations of the same port
- A/B testing different solutions
- Gradual migrations without big rewrites

### 4. **Framework Independence** 🆓

Core business logic is framework-agnostic:
- Migrate from Angular to React without changing domain
- Reuse business logic in backend services
- Share code between web, mobile, and server
- Future-proof against framework changes

### 5. **Clear Separation of Concerns** 📦

Each layer has a single, well-defined purpose:

| Layer | Knows About | Doesn't Know About |
|-------|-------------|-------------------|
| **Domain** | Business rules | HTTP, UI, databases |
| **Application** | Workflows | Frameworks, protocols |
| **Infrastructure** | Technologies | Business rules |
| **Presentation** | UI rendering | Data storage details |

### 6. **Team Scalability** 👥

Different teams can work independently:
- Backend team works on adapters
- Business analysts work on domain
- Frontend team works on presentation
- Minimal conflicts and dependencies

## When to Use It

### ✅ Good Fit

- Applications with complex business logic
- Long-term projects that will evolve
- Projects with multiple platforms (web, mobile, desktop)
- When you need to swap technologies frequently
- Teams with clear separation of concerns

### ⚠️ Consider Alternatives

- Simple CRUD applications
- Prototypes or proof-of-concepts
- Very small projects (< 5 screens)
- When time-to-market is critical and technical debt is acceptable

## The Mental Model

Think of your application as a **plugin system**:

1. **Core** (Domain + Application) = The engine
2. **Adapters** (Infrastructure) = Interchangeable plugins
3. **Ports** = Plugin interfaces

You can swap any plugin (adapter) without changing the engine (core business logic).

```
┌──────────────────────────────┐
│      Your Business Logic     │
│         (The Core)           │
└──────────────────────────────┘
         ↑        ↑        ↑
         │        │        │
    [Plugin]  [Plugin]  [Plugin]
     HTTP      LocalDB    Queue
```

## Common Pitfalls to Avoid

❌ **Don't** let domain depend on infrastructure  
❌ **Don't** mix business logic with HTTP calls  
❌ **Don't** put framework decorators in domain models  
❌ **Don't** reference adapters directly from use cases  

✅ **Do** keep domain pure and independent  
✅ **Do** use interfaces for all external interactions  
✅ **Do** inject ports, not implementations  
✅ **Do** keep use cases focused on single operations  

## Further Reading

- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)

---

**Your application now has a solid, maintainable, and scalable architecture! 🎉**
