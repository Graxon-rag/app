import { mockOrganizations } from "@/data/mockData";
import OrgCard from "@/components/organizations/OrgCard";
import { Building2 } from "lucide-react";

export default function Organizations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {mockOrganizations.length} organizations
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold
                           bg-primary-600 hover:bg-primary-700 text-white transition-all duration-150 shadow-sm"
        >
          <Building2 size={14} />
          New Organization
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockOrganizations.map((org) => (
          <OrgCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}
