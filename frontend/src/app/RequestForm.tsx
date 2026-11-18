import { useState } from "react";
import { createRequest } from "../domain/requests";
import type { ChangeRequestView } from "../domain/requests";
import type { EmergencyTag, Parent } from "../domain/types";
import { strings } from "../copy/strings";
import { parseLocalInputAsUTC } from "../domain/format";

interface RequestFormProps {
  affectedScheduleEntryId: string;
  author: Parent;
  onCreated: (request: ChangeRequestView) => void;
}

type EmergencyChoice = "none" | EmergencyTag;

/**
 * T057 (REQ-03, REQ-10, REQ-14): the "Request a change" form - proposed
 * date/time, optional alternative date, reason, and an emergency tag.
 * Shown inline on Schedule rows and on event detail.
 */
export function RequestForm({ affectedScheduleEntryId, author, onCreated }: RequestFormProps): React.ReactElement {
  const [proposedTime, setProposedTime] = useState("");
  const [alternativeTime, setAlternativeTime] = useState("");
  const [reason, setReason] = useState("");
  const [emergencyChoice, setEmergencyChoice] = useState<EmergencyChoice>("none");
  const [error, setError] = useState<string | undefined>(undefined);
  const [savedMessage, setSavedMessage] = useState<string | undefined>(undefined);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setError(undefined);
    setSavedMessage(undefined);

    const result = createRequest({
      author,
      affectedScheduleEntryId,
      proposedTime: parseLocalInputAsUTC(proposedTime),
      alternativeTime: alternativeTime ? parseLocalInputAsUTC(alternativeTime) : undefined,
      reason,
      emergencyTag: emergencyChoice === "none" ? undefined : emergencyChoice,
    });

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    if (result.value.savedOnDeviceWrittenTime) {
      setSavedMessage(strings.savedOnDeviceNotSentYet());
    }

    setProposedTime("");
    setAlternativeTime("");
    setReason("");
    setEmergencyChoice("none");
    onCreated(result.value);
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <h3>Request a change</h3>
      <label>
        Proposed date and time
        <input
          type="datetime-local"
          value={proposedTime}
          onChange={(e) => setProposedTime(e.target.value)}
        />
      </label>
      <label>
        Alternative date (optional)
        <input
          type="datetime-local"
          value={alternativeTime}
          onChange={(e) => setAlternativeTime(e.target.value)}
        />
      </label>
      <label>
        Reason
        <input value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <label>
        Emergency
        <select
          value={emergencyChoice}
          onChange={(e) => setEmergencyChoice(e.target.value as EmergencyChoice)}
        >
          <option value="none">None</option>
          <option value="illness">Unexpected child illness</option>
          <option value="emergency">Genuine emergency</option>
        </select>
      </label>
      {error ? <p className="request-form__error">{error}</p> : null}
      {savedMessage ? <p className="request-form__saved">{savedMessage}</p> : null}
      <button type="submit">Request a change</button>
    </form>
  );
}
