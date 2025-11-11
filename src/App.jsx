import { Routes, Route, Navigate } from "react-router-dom";
import EnrolmentForm from "./components/EnrolmentForm";

function App() {
  return (
    <Routes>
      <Route
        path="/cabra"
        element={<EnrolmentForm center="Cabramatta ABC" />}
      />
      <Route
        path="/liverpool"
        element={<EnrolmentForm center="Liverpool Mr Pauls Tutoring" />}
      />
      <Route path="/" element={<Navigate to="/cabra" replace />} />
    </Routes>
  );
}

export default App;
