import React, {FC} from 'react';

// normally this is going to implement a similar pattern
// learn more here: https://kcd.im/auth
export type User = {
  username: string;
  tagline: string;
  bio: string;
};

type AuthContextType = {
  user: User;
};

const AuthContext = React.createContext<AuthContextType>({
  user: {username: 'jakiechan', tagline: '', bio: ''},
});
AuthContext.displayName = 'AuthContext';

type AuthProviderProps = {
  user: {
    user: User;
  };
};
const AuthProvider: FC<AuthProviderProps> = ({user, ...props}) => (
  <AuthContext.Provider value={user} {...props} />
);

function useAuth() {
  return React.useContext(AuthContext);
}

export {AuthProvider, useAuth};
