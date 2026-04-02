import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, Loader, XCircle } from "lucide-react";
import { type PropsWithChildren, useState } from "react";

import { useApi } from "@/lib/api";
import { toErrorMessage } from "@/lib/errors";

type Props = PropsWithChildren<{
  ariaLabel?: string;
  className?: string;
  url: string;
}>;

export function AddTransferButton({
  children = "send to put.io",
  ariaLabel,
  className = "",
  url,
}: Props) {
  const api = useApi();
  const [viewInPutio, setViewInPutio] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.addTransfer(url),
    onSuccess: () => {
      setTimeout(() => setViewInPutio(true), 1000);
    },
    onError: () => {
      setTimeout(() => mutation.reset(), 3000);
    },
  });

  const phase = viewInPutio ? "view" : mutation.status;
  const { icon, text } = (() => {
    if (viewInPutio)
      return { icon: <ExternalLink className="text-green-600" />, text: "see in put.io" };
    if (mutation.isPending)
      return { icon: <Loader className="animate-spin text-xs" />, text: "sending" };
    if (mutation.isSuccess)
      return { icon: <CheckCircle2 className="text-green-600" />, text: "sent!" };
    if (mutation.isError)
      return { icon: <XCircle className="text-red-600" />, text: toErrorMessage(mutation.error) };
    return { icon: null, text: children };
  })();
  const accessibleLabel = typeof text === "string" ? text : (ariaLabel ?? "send to put.io");

  function handleClick() {
    if (viewInPutio) {
      window.open("https://put.io/transfers", "_blank");
      return;
    }
    if (mutation.isIdle) {
      mutation.mutate();
    }
  }

  return (
    <button
      type="button"
      className={`btn ${className}`}
      disabled={mutation.isPending}
      onClick={handleClick}
      aria-label={accessibleLabel}
    >
      <span
        key={phase}
        className="flex flex-row space-x-1 items-center justify-center text-sm animate-feedback-in"
      >
        {icon ? <span className="text-xs">{icon}</span> : null}
        <span className="leading-none">{text}</span>
      </span>
    </button>
  );
}
