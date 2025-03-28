import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./LoginPage";
import { PointsPage } from "./PointsPage";
import AdminPage from "./AdminPage"; // default import 방식으로 수정

function App() {
  return (
    <Router>
      <Routes>
        <Route path={process.env.PUBLIC_URL + "/"} element={<LoginPage />} />
        <Route
          path={process.env.PUBLIC_URL + "/points/:phone"}
          element={<PointsPage />}
        />
        <Route
          path={process.env.PUBLIC_URL + "/admin"}
          element={<AdminPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
