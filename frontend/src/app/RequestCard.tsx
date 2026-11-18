import { useState } from "react";
import { addDisputeNote, addFollowUp, editRequest, respond, withdrawRequest } from "../domain/requests";
import type { ChangeRequestView } from "../domain/requests";
import type { Parent } from "../domain/types";
import { getEvents } from "../domain/events";
import { getDeliveryState, markRead, retryDelivery } from "../domain/delivery";
import { strings } from "../copy/strings";
import { formatDateTime, formatTime, parseLocalInputAsUTC } from "../domain/format";
import { Avatar } from "./ui/Avatar";
import { NoticeGauge } from "./NoticeGauge";

interface RequestCardProps {
  request: ChangeRequestView;
  viewer: Parent;
  onChanged: () => void;
}

type Step = "idle" | "accepting" | "declining" | "editing" | "following-up" | "disputing";

/**
 * REQ-05, REQ-06, REQ-08, REQ-09, REQ-10, REQ-11: the Accept/Decline ->
 * Confirm two-action flow, Withdraw/Edit/Add-follow-up for the sender while
 * Pending, the four separately-shown timestamps, the overdue flag, and the
 * offline "saved on this device" label.
 */
export function RequestCard({ request, viewer, onChanged }: RequestCardProps): React.ReactElement {
  const [step, setStep] = useState<Step>("idle");
  const [reason, setReason] = useState("");
  const [showAlternative, setShowAlternative] = useState(false);
  const [alternativeTime, setAlternativeTime] = useState("");
  const [editProposedTime, setEditProposedTime] = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [disputeText, setDisputeText] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(viewer === request.proposer);

  // T064: a queued (not-yet-sent) item isn't a real request on the server
  // yet - no action can target it until the server actually has it.
  const isQueued = !!request.savedOnDeviceWrittenTime;
  const canRespond = !isQueued && viewer === request.responder && request.status === "Pending";
  const canWithdraw = !isQueued && viewer === request.proposer && request.status === "Pending";
  const canEdit = !isQueued && viewer === request.proposer && request.status === "Pending";

  const allEvents = getEvents(request.id);
  // "Items" per REQ-09: the request, the response, edits, withdraw,
  // follow-ups, and dispute notes - every event except the delivery/read
  // tracking events themselves.
  const items = allEvents.filter(
    (e) => e.type !== "delivered" && e.type !== "read" && e.type !== "delivery-failed",
  );
  function openDetails(): void {
    let markedAny = false;
    for (const item of items) {
      if (item.author !== viewer && getDeliveryState(item.id) === "delivered") {
        markRead(item.id, viewer);
        markedAny = true;
      }
    }
    if (markedAny) {
      onChanged();
    }
    setDetailsOpen(true);
  }

  function handleWithdraw(): void {
    withdrawRequest(request.id, viewer);
    onChanged();
  }

  function confirmEdit(): void {
    const result = editRequest(request.id, viewer, { proposedTime: editProposedTime || undefined });
    if (result.ok) {
      setStep("idle");
      setEditProposedTime("");
      onChanged();
    }
  }

  function confirmFollowUp(): void {
    const result = addFollowUp(request.id, viewer, followUpText);
    if (result.ok) {
      setStep("idle");
      setFollowUpText("");
      onChanged();
    }
  }

  function confirmDispute(): void {
    const result = addDisputeNote(request.id, viewer, disputeText);
    if (result.ok) {
      setStep("idle");
      setDisputeText("");
      onChanged();
    }
  }

  function confirmAccept(): void {
    respond({ requestId: request.id, author: viewer, decision: "accept" });
    setStep("idle");
    onChanged();
  }

  function confirmDecline(): void {
    const result = respond({
      requestId: request.id,
      author: viewer,
      decision: "decline",
      reason,
      alternativeTime:
        showAlternative && alternativeTime ? parseLocalInputAsUTC(alternativeTime) : undefined,
    });
    if (result.ok) {
      setStep("idle");
      setReason("");
      setShowAlternative(false);
      setAlternativeTime("");
      onChanged();
    }
  }

  return (
    <div className={`request-card request-card--${request.proposer.toLowerCase()}`} data-testid={`request-card-${request.id}`}>
      <div className="request-card__top">
        <Avatar parent={request.proposer} size={36} />
        <p className="request-card__summary">
          {request.proposer} proposed {formatDateTime(request.proposedTime)} — {request.reason}
        </p>
      </div>
      {request.status ? (
        <p className={`request-card__status status status--${request.status.toLowerCase()}`}>Status: {request.status}</p>
      ) : (
        <p className="request-card__status status status--unsent">Not sent yet</p>
      )}

      {request.savedOnDeviceWrittenTime ? (
        <div className="request-card__saved">
          <p>{strings.savedOnDeviceNotSentYet()}</p>
          <p>{strings.writtenDeviceTime(formatTime(request.savedOnDeviceWrittenTime))}</p>
        </div>
      ) : (
        <>
          <div className="request-card__notice-row">
            <NoticeGauge label={request.noticeLabel} />
            <p className="request-card__notice">{request.noticeLabel}</p>
          </div>
          {request.writtenNoticeContext ? (
            <p className="request-card__notice-context">{request.writtenNoticeContext}</p>
          ) : null}
          {request.overdue ? <p className="request-card__overdue">{strings.overdueFlag()}</p> : null}
          {request.status === "Lapsed" ? <p>{strings.lapsedMessage()}</p> : null}
          {viewer !== request.proposer && !detailsOpen ? (
            <button type="button" onClick={openDetails}>
              Open details
            </button>
          ) : null}
          {detailsOpen ? <ul className="request-card__timestamps">
            {items.map((item) => {
              const itemState = getDeliveryState(item.id);
              const deliveredEvent = allEvents.filter(
                (e) => e.type === "delivered" && e.targetEventId === item.id,
              ).at(-1);
              const readEvent = allEvents.filter(
                (e) => e.type === "read" && e.targetEventId === item.id,
              ).at(-1);
              const failedEvent = allEvents.filter(
                (e) => e.type === "delivery-failed" && e.targetEventId === item.id,
              ).at(-1);
              // T084 (REQ-09, F-12): each tracking state that has happened gets its
              // own line, so "Delivered" stays visible after "Read" is recorded and
              // an earlier failure stays visible after a successful retry.
              const nothingYet = !failedEvent && !deliveredEvent;

              return (
                <li key={item.id} className="request-card__item">
                  <span className="request-card__item-type">{strings.itemLabel(item.type, item.author)}</span>
                  {item.writtenTime ? (
                    <span>{strings.writtenDeviceTime(formatTime(item.writtenTime))}</span>
                  ) : null}
                  <span>{strings.receivedByServer(formatTime(item.serverTime))}</span>
                  {failedEvent ? (
                    <span className="request-card__delivery">
                      {strings.notDeliveredAt(formatTime(failedEvent.serverTime))}
                    </span>
                  ) : null}
                  {deliveredEvent ? (
                    <span className="request-card__delivery">
                      {strings.deliveredAt(formatTime(deliveredEvent.serverTime))}
                    </span>
                  ) : null}
                  {readEvent ? (
                    <span className="request-card__delivery">
                      {strings.readAt(formatTime(readEvent.serverTime))}
                    </span>
                  ) : null}
                  {nothingYet ? (
                    <span className="request-card__delivery">
                      {itemState === "waiting-offline"
                        ? strings.waitingForOfflineParent()
                        : strings.waitingForDelivery()}
                    </span>
                  ) : null}
                  {itemState === "not-delivered" && item.author === viewer ? (
                    <button
                      type="button"
                      onClick={() => {
                        retryDelivery(item.id, viewer);
                        onChanged();
                      }}
                    >
                      Retry
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul> : null}
        </>
      )}

      {request.emergencyTag ? (
        <div className="request-card__emergency">
          <p>{strings.emergencyClaimedBy(request.proposer)}</p>
          {viewer !== request.proposer && step !== "disputing" && (
            <button type="button" onClick={() => setStep("disputing")}>
              Add dispute note
            </button>
          )}
          {viewer !== request.proposer && step === "disputing" && (
            <div className="request-card__confirm">
              <label>
                Dispute note
                <input value={disputeText} onChange={(e) => setDisputeText(e.target.value)} />
              </label>
              <button type="button" onClick={confirmDispute}>
                Add
              </button>
              <button type="button" onClick={() => setStep("idle")}>
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : null}

      {canWithdraw && step === "idle" && (
        <div className="request-card__withdraw">
          <button type="button" onClick={handleWithdraw}>
            Withdraw
          </button>
          <button type="button" onClick={() => setStep("editing")}>
            Edit
          </button>
          <button type="button" onClick={() => setStep("following-up")}>
            Add follow-up
          </button>
        </div>
      )}

      {canEdit && step === "editing" && (
        <div className="request-card__confirm">
          <label>
            New proposed time
            <input
              type="datetime-local"
              onChange={(e) => setEditProposedTime(parseLocalInputAsUTC(e.target.value))}
            />
          </label>
          <button type="button" onClick={confirmEdit}>
            Save
          </button>
          <button type="button" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
      )}

      {canWithdraw && step === "following-up" && (
        <div className="request-card__confirm">
          <label>
            Follow-up
            <input value={followUpText} onChange={(e) => setFollowUpText(e.target.value)} />
          </label>
          <button type="button" onClick={confirmFollowUp}>
            Add
          </button>
          <button type="button" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
      )}

      {canRespond && step === "idle" && (
        <div className="request-card__actions">
          <button type="button" onClick={() => setStep("accepting")}>
            Accept
          </button>
          <button type="button" onClick={() => setStep("declining")}>
            Decline
          </button>
        </div>
      )}

      {canRespond && step === "accepting" && (
        <div className="request-card__confirm">
          <button type="button" onClick={confirmAccept}>
            Confirm
          </button>
          <button type="button" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
      )}

      {canRespond && step === "declining" && (
        <div className="request-card__confirm">
          <label>
            Reason
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          <label>
            <input
              type="checkbox"
              checked={showAlternative}
              onChange={(e) => setShowAlternative(e.target.checked)}
            />
            Suggest an alternative
          </label>
          {showAlternative && (
            <label>
              Alternative time
              <input
                type="datetime-local"
                value={alternativeTime}
                onChange={(e) => setAlternativeTime(e.target.value)}
              />
            </label>
          )}
          <button type="button" onClick={confirmDecline}>
            Confirm
          </button>
          <button type="button" onClick={() => setStep("idle")}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
