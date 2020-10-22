// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import React, {FC, useContext} from 'react';
import {Switch, SwitchProps} from '../switch';

type ToggleContextType = {
  on: boolean;
  toggle: () => void;
};

const ToggleContext = React.createContext<ToggleContextType | null>(null);
ToggleContext.displayName = `ToggleContext`;

type ToggleProps = {
  onToggle?: (on: boolean) => void;
};

const Toggle: FC<ToggleProps> = ({onToggle, children}) => {
  const [on, setOn] = React.useState(false);
  const toggle = React.useCallback(() => setOn(!on), [on]);
  const value = {on, toggle};

  return (
    <ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>
  );
};

function useToggleContext() {
  const context = useContext(ToggleContext);
  if (!context)
    throw new Error(`usetToggleContect should under Togggle Component`);
  return context;
}

const ToggleOn: FC = ({children}) => {
  const {on} = useToggleContext();
  return on ? <>{children}</> : null;
};

const ToggleOff: FC = ({children}) => {
  const {on} = useToggleContext();
  return on ? null : <>{children}</>;
};

const ToggleButton: FC<Omit<SwitchProps, 'on' | 'onClick' | 'ref'>> = props => {
  const {on, toggle} = useToggleContext();
  return <Switch on={on} onClick={toggle} {...props} />;
};

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        <div>
          <ToggleButton />
        </div>
      </Toggle>
    </div>
  );
}

export default App;

/*
eslint
  no-unused-vars: "off",
*/
