import SettingsIcon from "./icons/settings-icon";
import HomeIcon from "./icons/home-icon";
import {
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from 'react';
import ArrowLeftIcon from './icons/arrow-left-icon';
import { UserContext } from './contexts';

const SidebarValue = ['home', 'settings'] as const;
export type SidebarValue = typeof SidebarValue[number];

interface SidebarItem {
  value: SidebarValue;
  content: ReactElement;
  additionalContent?: ReactNode;
}

export default function Sidebar(
  {
    onChange = () => {},
    initial = 'home'
  }:
  {
    onChange?: (value: SidebarValue) => void,
    initial?: SidebarValue,
  }
) {
  const [value, setValue] = useState<SidebarValue>(initial);
  const [wasOnSettings, setWasOnSettings] = useState<boolean>(false);
  const {userName} = useContext(UserContext);

  const SidebarItems: SidebarItem[] = [
    {
      value: 'home',
      content: <HomeIcon />,
    },
    {
      value: 'settings',
      content: <div className="position-relative ignore-blur"><SettingsIcon /></div>,
      additionalContent: (
          showSettingsDialog() && <div className="tooltip-dialog p-3 d-flex flex-row" style={{ left: 45, top: 40 }}>
            <ArrowLeftIcon/>
            <span className="mx-2">
              Have a look at the settings to set your username and audio
              devices.
            </span>
          </div>
      ),
    },
  ];

  function select(value: SidebarValue) {
    setValue(value);
    onChange(value);
    if (value === 'settings') {
      setWasOnSettings(true);
    }
  }

  function isGuid() {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userName);
  }

  function showSettingsDialog() {
    return value !== 'settings' && !wasOnSettings && isGuid();
  }

  return (
    <div>
      { showSettingsDialog() && <div className="blur"></div> }
      <div className="bg-darker d-flex flex-row flex-md-column h-md-100 justify-content-start">
        {SidebarItems.map((i, index) => (
          <div key={`sidebarItem${index}`}>
            {i.additionalContent}
            <button
              className={`btn-sidebar p-2 ${value === i.value ? 'btn-sidebar-selected' : ''}`}
              onClick={() => select(i.value)}
            >
              {i.content}
            </button>
          </div>
        ))}
        <div className="flex-md-grow-1 bg-darker"></div>
      </div>
    </div>
  );
}
