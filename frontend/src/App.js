import { Routes, Route } from "react-router-dom";

import { Dashboard, UserDetail, ProductDetail } from "./pages";
import ROUTE from "./constants/routes";

function App() {
  return (
    <Routes>
      <Route path={ROUTE.dashboard} element={<Dashboard />} />
      <Route path={ROUTE.user_detail} element={<UserDetail />} />
      <Route path={ROUTE.product_detail} element={<ProductDetail />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
