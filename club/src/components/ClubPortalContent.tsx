import CustomerPortal from "@/components/CustomerPortal";
import { useAuth } from "@tagadapay/plugin-sdk/react";
import { useEffect } from "react";
import { Route, Router, Switch, useLocation } from "wouter";

function ClubPortalContent() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (
      !isAuthenticated &&
      location !== "/enter" &&
      isInitialized &&
      !isLoading
    ) {
      navigate("/enter", { replace: true });
    }
  }, [isAuthenticated, isInitialized, isLoading, location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto">
        <div className="w-full min-h-screen">
          <Router base="/portal">
            <Switch>
              <Route path="/">
                <CustomerPortal />
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
    </div>
  );
}

export default ClubPortalContent;
