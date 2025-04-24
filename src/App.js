// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./LoginPage";
import PointsPage from "./PointsPage";
import SignupPage from "./SignupPage";
import AdminPage from "./AdminPage";
import FindAccountPage from "./FindAccountPage";
import MemberPage from "./MemberPage";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/points/:phone" element={<PointsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/findaccount" element={<FindAccountPage />} />
        <Route path="/members" element={<MemberPage />} />
      </Routes>
    </Router>
  );
}

export default App;
