import { Outlet, useParams, Navigate } from "react-router-dom";
import { mockOrganizations } from "@/data/mockData";

export default function OrgLayout() {
  const { org_id } = useParams();
  const org = mockOrganizations.find((o) => o.id === org_id);

  if (!org) {
    return <Navigate to="/organizations" replace />;
  }

  return <Outlet />;
}
