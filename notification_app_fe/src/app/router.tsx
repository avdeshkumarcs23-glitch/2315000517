import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "../components/app-shell";
import { AllNotificationsPage } from "../pages/all-notifications-page";
import { NotFoundPage } from "../pages/not-found-page";
import { PriorityInboxPage } from "../pages/priority-inbox-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <AllNotificationsPage /> },
      { path: "priority", element: <PriorityInboxPage /> },
    ],
  },
]);
