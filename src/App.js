import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { PointsPage } from "./PointsPage";
import AdminPage from "./AdminPage"; // default import 방식으로 수정

function App() {
  return (
    <Router basename="process.env.PUBLIC_URL">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/points/:phone" element={<PointsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
