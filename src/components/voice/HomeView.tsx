import classNames from "classnames";
import { useEffect } from "react";
import LineIcon, { type LineIconName } from "@/components/ui/LineIcon";
import { groupAccountNumber } from "@/lib/accountNumber";
import { formatBalance } from "@/lib/money";
import { useGetBalanceQuery } from "@/services/accounts/accountsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sessionEnded } from "@/store/slices/sessionSlice";
import type { HomeLayout } from "@/types/voice";

function ActionRow({ icon, label }: { icon: LineIconName; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-edge bg-surface p-[11px] pr-4">
      <span className="flex size-[52px] flex-none items-center justify-center rounded-full bg-black text-accent">
        <LineIcon name={icon} className="size-7" />
      </span>
      <span className="flex-1 text-xl font-bold">{label}</span>
      <LineIcon name="chevronRight" className="size-6" strokeWidth={2.5} />
    </div>
  );
}

interface HomeViewProps {
  layout: HomeLayout;
  onToggleLayout: () => void;
  onSwitchToVoice: () => void;
  inert?: boolean;
}

const HEADER_BUTTON =
  "flex size-11 flex-none items-center justify-center rounded-full bg-surface text-accent outline-offset-4 outline-accent focus-visible:outline-4";

export default function HomeView({
  layout,
  onToggleLayout,
  onSwitchToVoice,
  inert,
}: HomeViewProps) {
  const dispatch = useAppDispatch();
  const customer = useAppSelector((state) => state.customer.saved);
  const signedIn = useAppSelector((state) => state.session.accessToken !== null);
  const {
    data: balance,
    error,
    isFetching,
  } = useGetBalanceQuery(undefined, {
    skip: !signedIn,
    refetchOnMountOrArgChange: true,
  });
  const sessionExpired =
    typeof error === "object" && "status" in error && error.status === 401;

  useEffect(() => {
    if (sessionExpired) dispatch(sessionEnded());
  }, [sessionExpired, dispatch]);

  const apart = layout === "apart";
  const firstName = customer?.name.trim().split(/\s+/)[0] ?? "";
  const accountNumber = balance?.accountNumber ?? customer?.accountNumber ?? "";

  return (
    <div
      inert={inert}
      className={classNames(
        "absolute inset-0 flex flex-col overflow-y-auto px-5 pt-[76px] pb-10",
        apart ? "justify-between gap-5" : "justify-center-safe gap-5",
      )}
    >
      <div className="flex flex-col gap-[22px]">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl">
            Hello, <span className="font-bold">{firstName}</span>
          </h1>
          <div className="flex flex-none items-center gap-3">
            <button
              type="button"
              onClick={onSwitchToVoice}
              aria-label="Switch to voice"
              className={HEADER_BUTTON}
            >
              <LineIcon name="mic" className="size-6" />
            </button>
            <button
              type="button"
              onClick={onToggleLayout}
              aria-label={
                apart ? "Bring everything to the middle" : "Spread everything out"
              }
              className={HEADER_BUTTON}
            >
              <LineIcon name={apart ? "contract" : "expand"} className="size-6" />
            </button>
          </div>
        </header>
        <section
          aria-label="Your account"
          className="flex flex-col rounded-2xl bg-accent p-6 text-on-accent"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="text-[15px] leading-tight font-medium">
              Account Balance
            </div>
            <LineIcon name="eye" className="size-[26px] flex-none" strokeWidth={2.25} />
          </div>
          <div
            aria-busy={isFetching}
            className="mt-1.5 text-[30px] leading-[1.15] font-extrabold tabular-nums wrap-anywhere"
          >
            {signedIn && balance
              ? formatBalance(balance.balanceKobo)
              : isFetching
                ? "₦…"
                : "₦—"}
          </div>
          <div className="mt-6 text-[15px] leading-tight font-medium">
            Account Number
          </div>
          <div className="mt-1.5 text-[26px] leading-[1.15] font-extrabold tabular-nums">
            {groupAccountNumber(accountNumber)}
          </div>
        </section>
      </div>
      <div className="flex flex-col gap-3">
        <ActionRow icon="send" label="Send Money" />
        <ActionRow icon="list" label="Recent Transactions" />
      </div>
    </div>
  );
}
