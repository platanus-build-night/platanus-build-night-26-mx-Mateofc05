import { PageHeaderSkeleton, TableSkeleton } from "@/components/skeletons";

export default function OutreachLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="p-6">
        <TableSkeleton rows={6} />
      </div>
    </>
  );
}
