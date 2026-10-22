import classNames from "classnames";
import Icon from "@/components/ui/Icon";
import { groupAccountNumber } from "@/lib/accountNumber";
import { formatNaira } from "@/lib/money";
import type { Receipt } from "@/types/receipt";
import type { OrbState, VisionZone } from "@/types/voice";
import VoiceOrb from "./VoiceOrb";

const ZONE_JUSTIFY: Record<VisionZone, string> = {
  center: "justify-center-safe",
  top: "justify-start",
  bottom: "justify-end-safe",
};

const RECEIPT_TIME = new Intl.DateTimeFormat("en-NG", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Africa/Lagos",
});

function shortReference(reference: string) {
  const code = reference.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${code.slice(0, 4)} ${code.slice(4)}`;
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-[11px]">
      <dt className="text-[1.0625em] text-label">{label}</dt>
      <dd className="text-[1.375em] leading-[1.2] font-bold tabular-nums wrap-anywhere">
        {value}
      </dd>
    </div>
  );
}

interface ReceiptViewProps {
  receipt: Receipt;
  zone: VisionZone;
  orb: OrbState | null;
  reduceMotion?: boolean;
  inert?: boolean;
}

export default function ReceiptView({
  receipt,
  zone,
  orb,
  reduceMotion,
  inert,
}: ReceiptViewProps) {
  const sent = receipt.direction === "sent";

  return (
    <section
      aria-label="Payment receipt"
      inert={inert}
      className={classNames(
        "absolute inset-0 flex flex-col items-center gap-6 overflow-y-auto px-6 pt-[52px] pb-[72px]",
        ZONE_JUSTIFY[zone],
      )}
    >
      <div className="text-[1.125em] font-bold text-label">
        SoloBanking receipt
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-[0.3em] text-[1.75em] font-bold text-success">
          <span className="flex size-[1.35em] items-center justify-center rounded-full bg-success text-black">
            <Icon name="check" className="text-[1.15em]" />
          </span>
          {sent ? "Sent" : "Received"}
        </div>
        <div className="text-[3.5em] leading-[1.05] font-bold text-accent tabular-nums wrap-anywhere">
          {formatNaira(receipt.amountKobo)}
        </div>
        <div className="text-[1.75em] leading-[1.15] font-bold wrap-anywhere">
          {sent ? "to" : "from"} {receipt.counterpartyName}
        </div>
      </div>
      <dl className="flex w-full flex-none flex-col divide-y divide-rule rounded-[28px] bg-surface px-[22px] py-2">
        <ReceiptRow
          label="Bank"
          value={receipt.bankName ?? `Bank code ${receipt.bankCode}`}
        />
        {receipt.counterpartyAccountNumber && (
          <ReceiptRow
            label="Account"
            value={groupAccountNumber(receipt.counterpartyAccountNumber)}
          />
        )}
        {receipt.customerName && (
          <ReceiptRow
            label={sent ? "From" : "To"}
            value={`${receipt.customerName}, •••• ${receipt.customerAccountNumber.slice(-4)}`}
          />
        )}
        <ReceiptRow
          label="Date"
          value={RECEIPT_TIME.format(new Date(receipt.completedAt))}
        />
        <ReceiptRow label="Reference" value={shortReference(receipt.reference)} />
      </dl>
      {orb ? (
        <VoiceOrb state={orb} compact reduceMotion={reduceMotion} />
      ) : (
        <div className="flex min-h-[160px] flex-none flex-col items-center justify-center gap-1 text-center">
          <div className="text-[1.375em] font-bold">Call ended</div>
          <div className="text-[1.125em] text-label">
            Tap three times to close
          </div>
        </div>
      )}
    </section>
  );
}
