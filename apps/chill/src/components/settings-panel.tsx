import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Folder } from "lucide-react";
import { match } from "ts-pattern";

import { useAuth } from "@/lib/auth";
import { DownloadFolderPicker } from "@/components/download-folder-picker";
import { UserErrorAlert } from "@/components/user-error-alert";
import { CheckboxGroup } from "@chill-institute/ui/components/ui/checkbox-group";
import { Label } from "@chill-institute/ui/components/ui/label";
import { Skeleton } from "@chill-institute/ui/components/ui/skeleton";
import { Switch } from "@chill-institute/ui/components/ui/switch";
import { combineQueries } from "@/queries/combine";
import { useSettingsQuery, useSaveSettings } from "@/queries/settings";
import { useDownloadFolderQuery } from "@/queries/download-folder";
import { useIndexersQuery } from "@/queries/indexers";
import { useProfileQuery } from "@/queries/profile";
import { useTheme } from "@/hooks/use-theme";
import { publicLinks } from "@/lib/public-links";
import {
  defaultUserSettings,
  searchResultDisplayBehaviorLabels,
  searchResultDisplayBehaviors,
  searchResultTitleBehaviorLabels,
  searchResultTitleBehaviors,
  type UserSettings,
} from "@/lib/types";

const LINKS = [
  { title: "About the Institute", url: publicLinks.about },
  { title: "Chilly guides", url: publicLinks.guides },
  { title: "GitHub", url: publicLinks.github },
  { title: "X (Twitter)", url: publicLinks.x },
  { title: "Email", url: publicLinks.email },
  { title: "Reddit", url: publicLinks.reddit },
];

function NativeSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className="w-full cursor-pointer appearance-none rounded border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 hover:transition-colors px-2 py-1.5"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-medium">{children}</h5>;
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="my-0.5">{children}</div>;
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <SectionTitle>Signed in as</SectionTitle>
        <SectionBody>
          <div className="flex flex-row p-2 items-center space-x-2 rounded border border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </SectionBody>
      </div>

      <div>
        <SectionTitle>User-interface theme</SectionTitle>
        <SectionBody>
          <Skeleton className="h-8 w-full" />
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Download folder</SectionTitle>
        <SectionBody>
          <Skeleton className="h-10 w-full" />
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Movies</SectionTitle>
        <SectionBody>
          <Skeleton className="h-5 w-full" />
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Search settings</SectionTitle>
        <SectionBody>
          <Skeleton className="h-5 w-full" />
        </SectionBody>
        <SectionBody>
          <Skeleton className="h-5 w-full" />
        </SectionBody>
        <SectionBody>
          <Skeleton className="h-5 w-full" />
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Search using the following trackers</SectionTitle>
        <div className="h-0.5" />
        <SectionBody>
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Search result display behavior</SectionTitle>
        <SectionBody>
          <Skeleton className="h-8 w-full" />
        </SectionBody>
      </div>

      <div>
        <SectionTitle>Search result name behavior</SectionTitle>
        <SectionBody>
          <Skeleton className="h-8 w-full" />
        </SectionBody>
      </div>
    </div>
  );
}

export function SettingsPanel() {
  const auth = useAuth();
  const [draft, setDraft] = useState<null | UserSettings>(null);
  const { theme, setTheme, systemDark } = useTheme();

  const configQuery = useSettingsQuery();
  const indexersQuery = useIndexersQuery();
  const profileQuery = useProfileQuery();
  const downloadFolderQuery = useDownloadFolderQuery();

  useEffect(() => {
    if (configQuery.data) {
      setDraft(configQuery.data);
    }
  }, [configQuery.data]);

  const saveMutation = useSaveSettings();

  const indexerOptions = useMemo(
    () => (indexersQuery.data ?? []).map((indexer) => ({ id: indexer.id, label: indexer.name })),
    [indexersQuery.data],
  );

  const persistPatch = (patch: Partial<UserSettings>) => {
    const base = draft ?? configQuery.data;
    if (!base) return;
    const next = { ...base, ...patch };
    setDraft(next);
    saveMutation.mutate(next);
  };

  const resetSettings = () => {
    const base = draft ?? configQuery.data;
    if (!base) return;
    const next = { ...base, ...defaultUserSettings } as UserSettings;
    setDraft(next);
    saveMutation.mutate(next);
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  const combined = combineQueries(configQuery, indexersQuery);

  return match(combined)
    .with({ status: "pending" }, () => <SettingsSkeleton />)
    .with({ status: "error" }, (q) => <UserErrorAlert error={q.error} />)
    .with({ status: "success" }, ({ data: [config] }) => {
      const effective = draft ?? config;

      const downloadFolderContent = match(downloadFolderQuery)
        .with({ status: "pending" }, () => <Skeleton className="h-10 w-full" />)
        .with({ status: "error" }, (dq) => <UserErrorAlert error={dq.error} />)
        .with({ status: "success" }, (dq) => {
          const hasMatchingFolder =
            effective.downloadFolderId === undefined ||
            dq.data.folder?.id === effective.downloadFolderId;

          if (!hasMatchingFolder) {
            return <Skeleton className="h-10 w-full" />;
          }

          return (
            <div className="flex flex-row space-x-2 p-2 items-center rounded border border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
              <div className="w-full flex items-center space-x-2">
                <Folder />
                <span>{dq.data.folder?.name ?? "Unknown"}</span>
              </div>
              <div className="ml-auto">
                {dq.data.folder?.id ? (
                  <DownloadFolderPicker
                    folderId={dq.data.folder.id}
                    onSave={(id) => persistPatch({ downloadFolderId: id })}
                  />
                ) : null}
              </div>
            </div>
          );
        })
        .exhaustive();

      return (
        <div className="flex flex-col space-y-6">
          <div>
            <SectionTitle>Signed in as</SectionTitle>
            <SectionBody>
              <div className="flex flex-row p-2 justify-between items-center rounded border border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
                <div className="flex flex-row space-x-2 items-center">
                  {profileQuery.data?.avatarUrl ? (
                    <img
                      alt={profileQuery.data.username}
                      className="rounded-full"
                      height={24}
                      src={profileQuery.data.avatarUrl}
                      width={24}
                    />
                  ) : null}
                  <span>{profileQuery.data?.username ?? "put.io user"}</span>
                </div>
                <div className="flex flex-row space-x-2 items-center">
                  <button
                    type="button"
                    className="ml-auto cursor-pointer text-sm dark:text-stone-400 dark:hover:text-stone-100 text-stone-600 hover:text-stone-950 hover:underline"
                    onClick={resetSettings}
                  >
                    reset settings
                  </button>
                  <Link
                    to="/sign-out"
                    search={{ error: undefined }}
                    className="ml-auto text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                  >
                    sign out
                  </Link>
                </div>
              </div>
            </SectionBody>
          </div>

          <div>
            <SectionTitle>User-interface theme</SectionTitle>
            <SectionBody>
              <NativeSelect
                onChange={(event) => {
                  setTheme(event.target.value as "dark" | "light" | "system");
                }}
                value={theme}
              >
                <option value="system">{`System (${systemDark ? "dark" : "light"})`}</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </NativeSelect>
            </SectionBody>
          </div>

          <div>
            <SectionTitle>Download folder</SectionTitle>
            <SectionBody>{downloadFolderContent}</SectionBody>
          </div>

          <div>
            <SectionTitle>Search settings</SectionTitle>
            <SectionBody>
              <div className="flex items-center justify-between space-x-1">
                <Label htmlFor="filter-nasty">Try to filter out nasty stuff</Label>
                <Switch
                  id="filter-nasty"
                  aria-label="Try to filter out nasty stuff"
                  checked={effective.filterNastyResults}
                  onCheckedChange={(checked) =>
                    persistPatch({ filterNastyResults: checked === true })
                  }
                />
              </div>
            </SectionBody>
            <SectionBody>
              <div className="flex items-center justify-between space-x-1">
                <Label htmlFor="filter-no-seeders">Hide results with no seeders</Label>
                <Switch
                  id="filter-no-seeders"
                  aria-label="Hide results with no seeders"
                  checked={effective.filterResultsWithNoSeeders}
                  onCheckedChange={(checked) =>
                    persistPatch({ filterResultsWithNoSeeders: checked === true })
                  }
                />
              </div>
            </SectionBody>
            <SectionBody>
              <div className="flex items-center justify-between space-x-1">
                <Label htmlFor="remember-filters">Remember quick filters</Label>
                <Switch
                  id="remember-filters"
                  aria-label="Remember quick filters"
                  checked={effective.rememberQuickFilters}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      persistPatch({
                        rememberQuickFilters: false,
                        codecFilters: [],
                        resolutionFilters: [],
                        otherFilters: [],
                      });
                      return;
                    }
                    persistPatch({ rememberQuickFilters: true });
                  }}
                />
              </div>
            </SectionBody>
          </div>

          <div>
            <SectionTitle>Search using the following trackers</SectionTitle>
            <div className="h-0.5" />
            <SectionBody>
              <CheckboxGroup
                options={indexerOptions}
                uncheckedItems={effective.disabledIndexerIds}
                onChange={(disabledIndexerIds) => persistPatch({ disabledIndexerIds })}
              />
            </SectionBody>
          </div>

          <div>
            <SectionTitle>Search result display behavior</SectionTitle>
            <SectionBody>
              <NativeSelect
                onChange={(event) =>
                  persistPatch({
                    searchResultDisplayBehavior: Number(
                      event.target.value,
                    ) as UserSettings["searchResultDisplayBehavior"],
                  })
                }
                value={effective.searchResultDisplayBehavior}
              >
                {searchResultDisplayBehaviors.map((behavior) => (
                  <option key={behavior} value={behavior}>
                    {searchResultDisplayBehaviorLabels[behavior]}
                  </option>
                ))}
              </NativeSelect>
            </SectionBody>
          </div>

          <div>
            <SectionTitle>Search result name behavior</SectionTitle>
            <SectionBody>
              <NativeSelect
                onChange={(event) =>
                  persistPatch({
                    searchResultTitleBehavior: Number(
                      event.target.value,
                    ) as UserSettings["searchResultTitleBehavior"],
                  })
                }
                value={effective.searchResultTitleBehavior}
              >
                {searchResultTitleBehaviors.map((behavior) => (
                  <option key={behavior} value={behavior}>
                    {searchResultTitleBehaviorLabels[behavior]}
                  </option>
                ))}
              </NativeSelect>
            </SectionBody>
          </div>

          <div>
            <SectionBody>
              <ul className="list-disc ml-3">
                {LINKS.map(({ title, url }) => (
                  <li className="dark:text-stone-400 text-stone-600" key={url}>
                    <a
                      className="dark:text-stone-400 dark:hover:text-stone-100 text-stone-600 hover:text-stone-950 inline-block"
                      href={url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <div className="flex flex-row items-center space-x-1">
                        <span>{title}</span>
                        <ArrowUpRight className="text-xs" strokeWidth={1.25} />
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </SectionBody>
          </div>

          {saveMutation.error ? <UserErrorAlert error={saveMutation.error} /> : null}

          <div className="dark:text-stone-400 text-stone-600 text-xs font-mono">
            release: {import.meta.env.VITE_PUBLIC_RELEASE ?? "dev"}
          </div>
        </div>
      );
    })
    .exhaustive();
}
