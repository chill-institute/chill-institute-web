import { Skeleton } from "@/components/ui/skeleton";

function SearchResultCardLoading() {
  return (
    <div className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
      <div className="py-5 px-6">
        <Skeleton className="h-6 w-full" />

        <div className="flex flex-row items-center justify-between my-3 py-3 gap-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

function SearchResultTableRowLoading() {
  return (
    <tr>
      <td className="pr-2 pt-3 text-left w-1/2">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="px-2 pt-3 text-left whitespace-nowrap">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="px-2 pt-3 text-left whitespace-nowrap">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="px-2 pt-3 text-left whitespace-nowrap">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="px-2 pt-3 text-left whitespace-nowrap">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="px-2 pt-3 text-left whitespace-nowrap">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
      <td className="pl-1 pt-3 whitespace-nowrap w-25">
        <Skeleton className="h-5 w-full mb-2" />
      </td>
    </tr>
  );
}

export function FilterBarLoading() {
  return (
    <div className="flex flex-col space-y-6 mt-6 mb-2 lg:items-center">
      <div className="flex flex-col items-start lg:items-center">
        <div className="flex flex-row items-center space-x-3">
          <div className="flex flex-row space-x-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="h-4 w-px bg-stone-400 dark:bg-stone-700" />
          <div className="flex flex-row space-x-2">
            <Skeleton className="h-5 w-10" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="h-4 w-px bg-stone-400 dark:bg-stone-700" />
          <div className="flex flex-row space-x-2">
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start lg:hidden lg:items-center">
        <div className="flex flex-row space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    </div>
  );
}

export function SearchLoading() {
  return (
    <>
      <div className="hidden lg:block w-full max-w-5xl mx-auto">
        <table className="w-full min-w-full">
          <tbody>
            {Array.from({ length: 17 }, (_, i) => (
              <SearchResultTableRowLoading key={`row-${String(i)}`} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col space-y-4 lg:hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <SearchResultCardLoading key={`card-${String(i)}`} />
        ))}
      </div>
    </>
  );
}
