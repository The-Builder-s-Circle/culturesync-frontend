import { Link, Outlet, useNavigate } from "react-router-dom";

export default function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
  
}
