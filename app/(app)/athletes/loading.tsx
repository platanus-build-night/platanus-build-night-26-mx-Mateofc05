import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function AthletesLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="p-6">
        <CardGridSkeleton />
      </div>
    </>
  );
}
