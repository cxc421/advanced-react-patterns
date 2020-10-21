// Compound Components
// http://localhost:3000/isolated/exercise/02.tsx

import React, {FC} from 'react';
import {Switch} from '../switch';

type ToggleOnOffProps = {on?: boolean};

const ToggleOn: FC<ToggleOnOffProps> = ({on, children}) =>
  on ? <>{children}</> : null;
ToggleOn.displayName = `ToggleOn`;

const ToggleOff: FC<ToggleOnOffProps> = ({on, children}) =>
  !on ? <>{children}</> : null;

type ToggleButtonInnerProps = {
  on: boolean;
  toggle: () => void;
};

const ToggleButtonInner: FC<ToggleButtonInnerProps> = ({on, toggle}) => (
  <Switch on={on} onClick={() => toggle()} />
);

const ToggleButton: FC = () => null;

const Toggle: FC = ({children}) => {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);

  return (
    <>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
          return null;
        }
        if (child.type === ToggleOn || child.type === ToggleOff) {
          return React.cloneElement(
            child as React.ReactElement<ToggleOnOffProps>,
            {
              on,
            },
          );
        }
        if (child.type === ToggleButton) {
          return (
            <ToggleButtonInner
              on={on}
              toggle={toggle}
              children={child.props.children}
            />
          );
        }
        return child;
      })}
    </>
  );
};

function App() {
  return (
    <div>
      <Toggle>
        <ToggleOn>The button is on</ToggleOn>
        <ToggleOff>The button is off</ToggleOff>
        {/* <span>Hello</span> */}
        <ToggleButton />
      </Toggle>
    </div>
  );
}

export default App;
