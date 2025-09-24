import ClubLoginContent from "@/components/ClubLoginContent";
import ClubPortalContent from "@/components/ClubPortalContent";
import ClubVIPContent from "@/components/ClubVIPContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PluginConfig } from "@/types/plugin-config";
import { useAuth, usePluginConfig } from "@tagadapay/plugin-sdk/react";
import { useEffect } from "react";
import { Route, Router, Switch, useLocation } from "wouter";

function App() {
  const { config } = usePluginConfig<PluginConfig>();
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const colors = config.branding.colors;
  const primaryColor = colors.primary;
  const secondaryColor = colors.secondary;
  const canDisplayContent = isInitialized && !isLoading;

  // Guard: if authenticated, force user to stay on /enter
  useEffect(() => {
    if (
      !isAuthenticated &&
      location !== "/enter" &&
      isInitialized &&
      !isLoading
    ) {
      navigate("/enter", { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  return (
    <>
      {" "}
      <style
        dangerouslySetInnerHTML={{
          __html: ` :root {
        --primary-color: ${primaryColor};
        --ring: ${primaryColor};
        --secondary-color: ${secondaryColor};
      }`,
        }}
      />
      <Router>
        <Switch>
          <Route path="/enter">
            <ClubLoginContent isAuthenticated={isAuthenticated} />
          </Route>
          <Route path="/">
            {!canDisplayContent ? <LoadingSpinner /> : <ClubVIPContent />}
          </Route>
          <Route path="/portal">
            {!canDisplayContent ? <LoadingSpinner /> : <ClubPortalContent />}
          </Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;
