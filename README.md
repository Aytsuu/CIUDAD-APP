## Tech Stack
- **Frontend**: [React](https://react.dev/) + [Vite](https://vite.dev/guide/)

- **UI Component**: [Shadcn](https://ui.shadcn.com/docs/installation/vite)

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
   npm install -D tailwindcss postcss autoprefixer
   npm install -D @types/node
   npx shadcn@latest init
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

### Updating your Main Branch

```bash
git fetch origin
git checkout main
git pull
```

---

## Branch Naming Conventions

We follow a consistent naming convention for branches to maintain clarity and organization.

- **Feature Branches**:  
  `frontend/feature/{feature-name}` or `backend/feature/{feature-name}` or `mobile/feature/{feature-name}`
  Example:  
  `frontend/feature/add-login-page`  
  `backend/feature/create-user-api`
  `mobile/feature/register-page`

- **Bugfix Branches**:  
  `frontend/bugfix/{bugfix-name}` or `backend/bugfix/{bugfix-name}` or `mobile/bugfix/{feature-name}`
  Example:  
  `frontend/bugfix/fix-header-alignment`  
  `backend/bugfix/fix-user-authentication`
  `mobile/bugfix/fix-register-page`

- **Hotfix Branches**:  
  `frontend/hotfix/{hotfix-name}` or `backend/hotfix/{hotfix-name}` or `mobile/hotfix/{feature-name}`  
  Example:  
  `frontend/hotfix/fix-form-validation`  
  `backend/hotfix/fix-database-connection`
  `mobile/hotfix/fix-register-page`

- **Release Branches**:  
  `frontend/release/{version}` or `backend/release/{version}` or `mobile/release/{feature-name}`   
  Example:  
  `frontend/release/1.0.0`  
  `backend/release/1.0.0`
  `mobile/release/1.0.0`
  
- **Experimental Branches**:  
  `frontend/experiment/{experiment-name}` or `backend/experiment/{experiment-name}` or `mobile/experiment/{feature-name}`   
  Example:  
  `frontend/experiment/test-dark-mode`  
  `backend/experiment/test-api-performance`
  `mobile/experiment/test-ai`

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

#### ↓ Click the copy icon to get the full hash ↓

![image](https://github.com/user-attachments/assets/7067476c-6c5e-4c27-a1a6-03f2174242bc)

#### Merged branch

```bash
git revert -m 1 [commit-hash]
```

#### Pushed updates

```bash
git revert [commit-hash]
```

#### Restore all files from a specific commit

```bash
git checkout [commit-hash] -- .
```
