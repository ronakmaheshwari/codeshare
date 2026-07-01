import { useAuth } from "@/provider/authContext"
import { Spinner } from "../ui/spinner";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const {token, isLoading} = useAuth();
    if(isLoading) {
        return <Spinner />
    }

    if(!token) {
        return <Navigate to="/signup" replace />
    }

    return children;
}

export default ProtectedRoute