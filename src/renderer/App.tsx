import {MemoryRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.css";
import {useState} from "react";
import Sidebar, {SidebarValue} from "./sidebar";
import Home from "./home/home";
import Settings from "./settings/settings";
import State from "./state";
import ErrorDisplay from "./ErrorDisplay";



function Hello() {
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
    <State>
      <div className="d-flex flex-column flex-md-row w-100 vh-100 bg">
        <ErrorDisplay></ErrorDisplay>
        <Sidebar onChange={setSidebarValue} initial={'home'}/>
        <div className="flex-grow-1 p-4 p-md-5 vh-100 bg scrollable">
          { getWindow() }
        </div>
      </div>
    </State>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello/>}/>
      </Routes>
    </Router>
  );
}
