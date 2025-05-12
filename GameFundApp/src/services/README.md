# GameFundManager API Services and Models

This document provides information about the front-end services and models for the GameFundManager application.

## API Configuration

The API is configured in `src/config/api.config.ts`. This file contains:

- API base URL
- Timeout settings
- Credentials configuration
- Common API response structure

## Models

The models correspond to the data structures used by the backend API:

### User Model (`models/user.model.ts`)

- `User`: Represents a user in the system
- `LoginRequest`: Request payload for login API
- `RegisterRequest`: Request payload for registration API
- `AuthResponse`: Response from authentication endpoints

### Group Model (`models/group.model.ts`)

- `Group`: Represents a funding group
- `CreateGroupRequest`: Request payload for creating a group
- `GroupMember`: Represents a member of a group
- `AddGroupMemberRequest`: Request payload for adding a member to a group

### Contribution Model (`models/contribution.model.ts`)

- `Contribution`: Represents a financial contribution to a group
- `CreateContributionRequest`: Request payload for creating a contribution

### Expense Model (`models/expense.model.ts`)

- `ExpenseStatus`: Enum of expense status values
- `Expense`: Represents an expense from a group's funds
- `CreateExpenseRequest`: Request payload for creating an expense

### Poll Model (`models/poll.model.ts`)

- `PollType`: Enum of poll types
- `PollOption`: Represents an option in a poll
- `Poll`: Represents a poll in a group
- `CreatePollRequest`: Request payload for creating a poll
- `SubmitPollVoteRequest`: Request payload for submitting a vote

## Services

The services provide methods for interacting with the backend API:

### API Service (`services/api.service.ts`)

Base service for making HTTP requests to the API.

### Auth Service (`services/auth.service.ts`)

- `login(email, password)`: Authenticate a user and get a token
- `register(name, email, password)`: Register a new user 
- `getCurrentUser()`: Get the current authenticated user
- `logout()`: Sign out the current user

### User Service (`services/user.service.ts`)

- `getAllUsers()`: Get all users
- `getUserById(id)`: Get a specific user
- `updateUser(id, userData)`: Update user information

### Group Service (`services/group.service.ts`)

- `getAllGroups()`: Get all groups
- `getGroupById(id)`: Get a specific group
- `getUserGroups()`: Get groups for the current user
- `createGroup(groupData)`: Create a new group
- `updateGroup(id, groupData)`: Update a group
- `deleteGroup(id)`: Delete a group
- `getGroupMembers(groupId)`: Get members of a group
- `addGroupMember(memberData)`: Add a member to a group
- `removeGroupMember(groupId, memberId)`: Remove a member from a group

### Contribution Service (`services/contribution.service.ts`)

- `getGroupContributions(groupId)`: Get contributions for a group
- `getUserContributions()`: Get contributions for the current user
- `getContributionById(id)`: Get a specific contribution
- `addContribution(contributionData)`: Add a new contribution
- `updateContribution(id, contributionData)`: Update a contribution
- `deleteContribution(id)`: Delete a contribution

### Expense Service (`services/expense.service.ts`)

- `getGroupExpenses(groupId)`: Get expenses for a group
- `getExpensesByStatus(groupId, status)`: Get expenses with a specific status
- `getExpenseById(id)`: Get a specific expense
- `createExpense(expenseData)`: Create a new expense
- `updateExpense(id, expenseData)`: Update an expense
- `deleteExpense(id)`: Delete an expense
- `changeExpenseStatus(id, status)`: Change the status of an expense

### Poll Service (`services/poll.service.ts`)

- `getGroupPolls(groupId)`: Get polls for a group
- `getPollById(id)`: Get a specific poll
- `createPoll(pollData)`: Create a new poll
- `submitVote(voteData)`: Submit a vote for a poll
- `closePoll(id)`: Close a poll
- `deletePoll(id)`: Delete a poll

## Usage

Here's an example of how to use these services:

```typescript
import { authService, groupService } from '../services';

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password);
    console.log('Logged in successfully!');
    return response;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get user groups
const getUserGroups = async () => {
  try {
    const groups = await groupService.getUserGroups();
    console.log('User groups:', groups);
    return groups;
  } catch (error) {
    console.error('Failed to get user groups:', error);
  }
};
```

## Next Steps

To integrate the services with the UI:

1. Import the required service in your component/screen
2. Use React hooks to manage state and API calls
3. Handle loading states and errors appropriately
4. Display the data in your UI components
