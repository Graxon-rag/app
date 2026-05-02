import { Outlet, useParams, Navigate } from "react-router-dom";
import { useOrgStore } from "@/store/orgStore";
import { useEffect } from "react";

export default function OrgLayout() {
  const { org_id } = useParams();
  const { orgs, getAllOrgs, isLoading } = useOrgStore();

  useEffect(() => {
    if (orgs.length === 0) getAllOrgs();
  }, []);

  const org = orgs.find((o) => o.id === org_id);

  if (isLoading) return null; // or <Loader />

  if (!org) return <Navigate to="/organizations" replace />;

  return <Outlet />;
}
