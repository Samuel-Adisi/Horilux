import { PropertyCreateForm } from "./PropertyCreateForm";
import { AdminLayout } from "./AdminLayout";

export function PropertyCreatePage() {
  return (
    <AdminLayout pageTitle="New property" pageSubtitle="Add a property to the listing pipeline">
      <div className="max-w-2xl rounded-[8px] border border-[#E4E1D9] bg-white p-6">
        <PropertyCreateForm />
      </div>
    </AdminLayout>
  );
}
