import { Navigate, Outlet } from "react-router-dom";
// import Header from "../components/header/Header";
import { useAuth } from "../providers/authProvider";

export const ProtectedRoute = ({ children, redirectPath = "/login" }) => {
  const { token } = useAuth();
  console.log({ token });
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }
  return (
    <>
      {/* <Header /> */}
      {children ? children : <Outlet />}
    </>
  );
};
