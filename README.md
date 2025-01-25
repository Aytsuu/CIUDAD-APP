## Tech Stack
- **Frontend**: [React](https://react.dev/)

- **UI Component**: [HyperUI](https://www.hyperui.dev/)

- **Mobile**: [React-Native](https://reactnative.dev/)

- **Backend**: [Django](https://www.djangoproject.com/ttps://react.dev/)
  

---

## Getting Started

### Prerequisites

- **Node.js**
- **Git**
- **npm**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aytsuu008/CIUDAD-APP.git
   ```

2. Navigate to the project directory:

   ```bash
   cd apps
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Install mobile dependencies:

   ```bash
   cd barangay-mobile
   npm install
   ```

### Running the Project

#### Frontend

```bash
cd frontend
npm run dev
```

#### Mobile

```bash
cd barangay-mobile
npx expo start
```

## Branch Naming Conventions

We follow a consistent naming convention for branches to maintain clarity and organization.

- **Feature Branches**:  
  `frontend/feature/{feature-name}` or `backend/feature/{feature-name}`  
  Example:  
  `frontend/feature/add-login-page`  
  `backend/feature/create-user-api`

- **Bugfix Branches**:  
  `frontend/bugfix/{bugfix-name}` or `backend/bugfix/{bugfix-name}`  
  Example:  
  `frontend/bugfix/fix-header-alignment`  
  `backend/bugfix/fix-user-authentication`

- **Hotfix Branches**:  
  `frontend/hotfix/{hotfix-name}` or `backend/hotfix/{hotfix-name}`  
  Example:  
  `frontend/hotfix/fix-form-validation`  
  `backend/hotfix/fix-database-connection`

- **Release Branches**:  
  `frontend/release/{version}` or `backend/release/{version}`  
  Example:  
  `frontend/release/1.0.0`  
  `backend/release/1.0.0`

- **Experimental Branches**:  
  `frontend/experiment/{experiment-name}` or `backend/experiment/{experiment-name}`  
  Example:  
  `frontend/experiment/test-dark-mode`  
  `backend/experiment/test-api-performance`

---
## Branch Script 

#### Create a branch (if clone)

```bash
git checkout -b [branch_name]
```

#### Check your current branch

```bash
git status
```

## Revert Script (If you accidentally commit on main branch)

#### Merged branch

```bash
git revert -m 1 [commit hash code]
```

#### Pushed Updates

```bash
git revert [commit hash code]
```
