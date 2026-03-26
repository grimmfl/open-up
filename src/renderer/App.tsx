import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import {useState} from "react";
import Sidebar, {SidebarValue} from "./sidebar";
import Home from "./home/home";
import Settings from "./settings/settings";
import State from "./state";
import ErrorDisplay from "./ErrorDisplay";
import {UpdateDisplay} from "./update-display/update-display";


function AppContent() {
  const [sidebarValue, setSidebarValue] = useState<SidebarValue>('home');

  function getWindow() {
    switch (sidebarValue) {
      case 'home':
        return <Home/>;
      case 'settings':
        return <Settings/>;
    }
  }

  return (
    <div className="d-flex flex-column flex-md-row w-100 vh-100 bg">
        <Sidebar onChange={setSidebarValue} initial={'home'}/>
        <div className="flex-grow-1 p-4 p-md-5 vh-100 bg scrollable">
          { getWindow() }
        </div>
    </div>
  )
}


function StateWrapper() {
  return (
    <State>
      <div className="d-flex flex-column bg">
        <UpdateDisplay/>
        <div className="d-flex flex-column flex-md-row w-100 vh-100 bg">
          <ErrorDisplay></ErrorDisplay>
          <AppContent/>
        </div>
      </div>
    </State>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StateWrapper/>}/>
      </Routes>
    </Router>
  );
}
