import {
  PageHeaderSkeleton,
  MetricsSkeleton,
  CardGridSkeleton,
  TableSkeleton,
} from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="space-y-8 p-6">
        <MetricsSkeleton />
        <CardGridSkeleton count={3} />
        <TableSkeleton />
      </div>
    </>
  );
}
