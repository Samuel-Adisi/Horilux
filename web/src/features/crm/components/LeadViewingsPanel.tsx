import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Check, MoreHorizontal, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/display";
import { Menu, MenuItem } from "@/components/ui/overlay";
import { OutcomeTag, ViewingStatus } from "@/components/domain/status";
import { useCan } from "@/features/accounts/permissions";
import { getErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast";
import { useConfirmViewing, useViewings, type Viewing } from "@/features/viewings/api";
import { BookViewingDialog, CancelViewingDialog, CompleteViewingDialog } from "@/features/viewings/components/ViewingDialogs";

export function LeadViewingsPanel({ clientId }: { clientId: string }) {
  const can = useCan();
  const q = useViewings({ client: clientId });
  const confirm = useConfirmViewing();
  const [booking, setBooking] = useState(false);
  const [completing, setCompleting] = useState<Viewing | null>(null);
  const [cancelling, setCancelling] = useState<{ v: Viewing; noShow: boolean } | null>(null);
  const canAct = can("viewing", "edit");
  const rows = q.data?.results ?? [];

  async function doConfirm(v: Viewing) {
    try {
      await confirm.mutateAsync(v.id);
      toast.success("Viewing confirmed", v.client_name + " is expecting you.");
    } catch (err) {
      toast.error("Couldn't confirm", getErrorMessage(err));
    }
  }

  return (
    <Panel title="Viewings">
      <div className="space-y-4 text-sm">
        {rows.length === 0 && <p className="text-ink-muted">No viewing requested yet.</p>}
        {rows.map((v) => {
          const open = v.status === "scheduled" || v.status === "confirmed";
          return (
            <div key={v.id} className="space-y-2 border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">Viewing requested</p>
              <Link to={"/properties/" + v.property} className="block font-semibold hover:underline">{v.property_title}</Link>
              <p className="text-ink-muted">{formatDate(v.date)} at {v.time.slice(0, 5)}</p>
              <div className="flex items-center gap-2">
                <ViewingStatus status={v.status} />
                <OutcomeTag outcome={v.outcome} />
              </div>
              {canAct && open && (
                <div className="flex items-center gap-1">
                  {v.status === "scheduled" ? (
                    <Button size="sm" onClick={() => doConfirm(v)} loading={confirm.isPending && confirm.variables === v.id}>
                      Confirm
                    </Button>
                  ) : (
                    <Button size="sm" variant="primary" icon={<Check />} onClick={() => setCompleting(v)}>
                      Complete
                    </Button>
                  )}
                  <Menu
                    trigger={(t) => (
                      <Button {...t} size="icon" variant="ghost" className="h-7 w-7" aria-label="More">
                        <MoreHorizontal />
                      </Button>
                    )}
                  >
                    {(close) => (
                      <>
                        {v.status === "scheduled" && (
                          <MenuItem icon={<Check />} onClick={() => { close(); setCompleting(v); }}>
                            Record outcome
                          </MenuItem>
                        )}
                        <MenuItem icon={<UserX />} onClick={() => { close(); setCancelling({ v, noShow: true }); }}>
                          Client didn't show
                        </MenuItem>
                        <MenuItem icon={<X />} tone="danger" onClick={() => { close(); setCancelling({ v, noShow: false }); }}>
                          Cancel viewing
                        </MenuItem>
                      </>
                    )}
                  </Menu>
                </div>
              )}
            </div>
          );
        })}
        {can("viewing", "create") && (
          <Button size="sm" icon={<CalendarPlus />} onClick={() => setBooking(true)}>
            Book viewing
          </Button>
        )}
      </div>
      {booking && <BookViewingDialog clientId={clientId} onClose={() => setBooking(false)} />}
      {completing && <CompleteViewingDialog viewing={completing} onClose={() => setCompleting(null)} />}
      {cancelling && <CancelViewingDialog viewing={cancelling.v} noShow={cancelling.noShow} onClose={() => setCancelling(null)} />}
    </Panel>
  );
}
