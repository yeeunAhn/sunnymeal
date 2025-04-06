import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { PointsPage } from "./PointsPage";
import { SignupPage } from "./SignupPage";
import AdminPage from "./AdminPage";
import FindAccountPage from "./FindAccountPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/points/:phone" element={<PointsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/findaccount" element={<FindAccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
