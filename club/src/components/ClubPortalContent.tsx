import CustomerPortal from "@/components/CustomerPortal";
import { Route, Router, Switch } from "wouter";

function ClubPortalContent() {
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
