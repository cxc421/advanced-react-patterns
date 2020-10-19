// Context Module Functions
// http://localhost:3000/isolated/exercise/01.js

import React, {FC} from 'react';
import {dequal} from 'dequal';

// ./context/user-context.js

import * as userClient from '../user-client';
import {useAuth, User} from '../auth-context';

type UserState =
  | {
      status: null;
      user: User;
      storedUser: User;
      error: null;
    }
  | {
      status: 'pending';
      user: User;
      storedUser: User;
      error: null | Error;
    }
  | {
      status: 'resolved';
      user: User;
      storedUser: User;
      error: null;
    }
  | {
      status: 'rejected';
      user: User;
      storedUser: User;
      error: Error;
    };

type UserAction =
  | {
      type: 'start update';
      updates: Partial<User>;
    }
  | {
      type: 'finish update';
      updatedUser: User;
    }
  | {
      type: 'fail update';
      error: Error;
    }
  | {
      type: 'reset';
    };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'start update': {
      return {
        ...state,
        status: 'pending',
        user: {...state.user, ...action.updates},
        storedUser: state.user,
      };
    }
    case 'finish update': {
      return {
        ...state,
        status: 'resolved',
        user: action.updatedUser,
        error: null,
      };
    }
    case 'fail update': {
      return {
        ...state,
        status: 'rejected',
        error: action.error,
        user: state.storedUser,
      };
    }
    case 'reset': {
      return {
        ...state,
        status: null,
        error: null,
      };
    }
    default: {
      throw new Error(`Unhandled action ${JSON.stringify(action)}`);
    }
  }
}

type UserContextType = [UserState, React.Dispatch<UserAction>];
const UserContext = React.createContext<UserContextType | null>(null);
UserContext.displayName = 'UserContext';

const UserProvider: FC = ({children}) => {
  const {user} = useAuth();
  const [state, dispatch] = React.useReducer(userReducer, {
    status: null,
    error: null,
    storedUser: user,
    user,
  });
  const value: UserContextType = [state, dispatch];
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

function useUser() {
  const context = React.useContext(UserContext);
  if (context === null) {
    throw new Error(`useUser must be used within a UserProvider`);
  }
  return context;
}

// 🐨 add a function here called `updateUser`
// Then go down to the `handleSubmit` from `UserSettings` and put that logic in
// this function. It should accept: dispatch, user, and updates

// export {UserProvider, useUser}

// src/screens/user-profile.js
// import {UserProvider, useUser} from './context/user-context'
function UserSettings() {
  const [{user, status, error}, userDispatch] = useUser();

  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  const [formState, setFormState] = React.useState(user);

  const isChanged = !dequal(user, formState);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormState({...formState, [e.target.name]: e.target.value});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // 🐨 move the following logic to the `updateUser` function you create above
    userDispatch({type: 'start update', updates: formState});
    userClient.updateUser(user, formState).then(
      updatedUser => userDispatch({type: 'finish update', updatedUser}),
      error => userDispatch({type: 'fail update', error}),
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(user);
            userDispatch({type: 'reset'});
          }}
          disabled={!isChanged || isPending}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={(!isChanged && !isRejected) || isPending}
        >
          {isPending
            ? '...'
            : isRejected
            ? '✖ Try again'
            : isChanged
            ? 'Submit'
            : '✔'}
        </button>
        {isRejected ? (
          <pre style={{color: 'red'}}>{error && error.message}</pre>
        ) : null}
      </div>
    </form>
  );
}

function UserDataDisplay() {
  const [{user}] = useUser();
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}

function App() {
  return (
    <div
      style={{
        height: 350,
        width: 300,
        backgroundColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        overflow: 'scroll',
      }}
    >
      <UserProvider>
        <UserSettings />
        <UserDataDisplay />
      </UserProvider>
    </div>
  );
}

export default App;
