import SettingsIcon from "./icons/settings-icon";
import HomeIcon from "./icons/home-icon";
import {ReactElement, useState} from "react";

const SidebarValue = ['home', 'settings'] as const;
export type SidebarValue = typeof SidebarValue[number];

interface SidebarItem {
  value: SidebarValue;
  content: ReactElement;
}

const SidebarItems: SidebarItem[] = [
  {
    value: 'home',
    content: <HomeIcon/>,
  },
  {
    value: 'settings',
    content: <SettingsIcon/>,
  }
];

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

  function select(value: SidebarValue) {
    setValue(value);
    onChange(value);
  }

  return (
    <div className="bg-darker d-flex flex-row flex-md-column h-md-100 justify-content-start">
      {
        SidebarItems.map((i, index) =>
          <button key={`sidebarItem${index}`} className={`btn-sidebar p-2 ${value === i.value ? 'btn-sidebar-selected' : ''}`}
                  onClick={() => select(i.value)}>{i.content}</button>
        )
      }
      <div className="flex-md-grow-1 bg-darker"></div>
    </div>
  );
}
