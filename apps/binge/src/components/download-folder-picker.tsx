import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Folder, X } from "lucide-react";

import { useApi } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@chill-institute/ui/components/ui/popover";
import { ScrollArea } from "@chill-institute/ui/components/ui/scroll-area";
import { Skeleton } from "@chill-institute/ui/components/ui/skeleton";

type Props = {
  folderId: bigint;
  onSave: (id: bigint) => void;
};

export function DownloadFolderPicker({ folderId, onSave }: Props) {
  const api = useApi();
  const [open, setOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<bigint>(folderId);
  const [folderStack, setFolderStack] = useState<bigint[]>([]);

  useEffect(() => {
    setCurrentFolderId(folderId);
    setFolderStack([]);
  }, [folderId]);

  useEffect(() => {
    if (!open) {
      setCurrentFolderId(folderId);
      setFolderStack([]);
    }
  }, [folderId, open]);

  const folderQuery = useQuery({
    queryKey: ["folder", String(currentFolderId)],
    queryFn: ({ signal }) => api.getFolder(currentFolderId, signal),
    enabled: open,
  });

  const folders = useMemo(
    () =>
      (folderQuery.data?.files ?? []).filter(
        (file) => file.fileType === "FOLDER" && file.isShared === false,
      ),
    [folderQuery.data?.files],
  );

  const navigateInto = (id: bigint) => {
    setFolderStack((stack) => [...stack, currentFolderId]);
    setCurrentFolderId(id);
  };

  const navigateBack = () => {
    const stack = [...folderStack];
    const parentId = stack.pop();
    if (parentId !== undefined) {
      setFolderStack(stack);
      setCurrentFolderId(parentId);
    }
  };

  let content: React.ReactNode;
  if (folderQuery.status === "error") {
    content = (
      <EmptyState description="Maybe it's deleted?" icon="😕" title="Could not fetch the folder." />
    );
  } else if (folderQuery.status === "success") {
    content = (
      <div>
        <h5 className="font-medium">
          <span className="flex items-center space-y-0.5">
            {folderStack.length > 0 ? (
              <button
                className="-mb-1 cursor-pointer"
                onClick={navigateBack}
                type="button"
                aria-label="Go back to parent folder"
              >
                <ChevronLeft />
              </button>
            ) : null}
            <span className="line-clamp-1" title={folderQuery.data.parent?.name}>
              {folderQuery.data.parent?.name}
            </span>
          </span>
        </h5>

        <hr className="border-stone-950 dark:border-stone-700 my-1.5" />

        <ScrollArea className="h-40 pr-4">
          {folders.length ? (
            folders.map((file) => (
              <button
                className="w-full cursor-pointer flex items-center space-x-1.5"
                key={file.id}
                onClick={() => navigateInto(file.id)}
                title={file.name}
                type="button"
                aria-label={`Open folder ${file.name}`}
              >
                <Folder />
                <span className="flex-1 line-clamp-1 text-left" title={file.name}>
                  {file.name}
                </span>
              </button>
            ))
          ) : (
            <p>No folders in this directory.</p>
          )}
        </ScrollArea>

        <div className="flex items-center justify-end mt-4">
          <button
            type="button"
            className="btn"
            onClick={() => {
              onSave(currentFolderId);
              setOpen(false);
            }}
          >
            download here
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col space-y-4 mt-4">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/4" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/4" />
        </div>
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/4" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-2/4" />
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            className="cursor-pointer text-sm dark:text-stone-400 dark:hover:text-stone-100 text-stone-600 hover:text-stone-950 hover:underline"
            type="button"
          >
            change
          </button>
        }
      />

      <PopoverContent>
        {content}

        <PopoverClose
          aria-label="Close"
          className="absolute top-2 right-2 cursor-pointer dark:text-stone-500 dark:hover:text-stone-100 text-stone-600 hover:text-stone-950 text-sm"
        >
          <X />
        </PopoverClose>

        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
