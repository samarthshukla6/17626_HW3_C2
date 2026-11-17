import { useState } from "react";
import {
  advanceServerTime,
  getServerTime,
  setDeviceClockOffset,
  setServerTime,
} from "../domain/clock";
import { isOnline, setOnline, setServerUnreachable } from "../domain/offlineQueue";
import { failNextDelivery } from "../domain/delivery";
import { resetDemoData } from "../domain/store";
import { strings } from "../copy/strings";
import { formatDateTime, parseLocalInputAsUTC } from "../domain/format";
import type { Parent } from "../domain/types";

interface DemoControlsProps {
  onChanged: () => void;
}

/**
 * Testing aid, not part of the product (REQ-09, REQ-10, REQ-14 support).
 * Lets a reviewer reproduce every Acceptance Example by hand.
 */
export function DemoControls({ onChanged }: DemoControlsProps): React.ReactElement {
  const [resetConfirming, setResetConfirming] = useState(false);

  function advance(minutes: number): void {
    advanceServerTime(minutes);
    onChanged();
  }

  function toggleOnline(parent: Parent): void {
    setOnline(parent, !isOnline(parent));
    onChanged();
  }

  function offsetJason(minutes: number): void {
    setDeviceClockOffset("Jason", minutes);
    onChanged();
  }

  function confirmReset(): void {
    resetDemoData();
    setResetConfirming(false);
    onChanged();
  }

  return (
    <section aria-label="Demo controls" className="demo-controls">
      <h2>{strings.demoControlsLabel()}</h2>

      <p>Server time: {formatDateTime(getServerTime())}</p>
      <button type="button" onClick={() => advance(60)}>
        Advance server clock +1 h
      </button>
      <button type="button" onClick={() => advance(24 * 60)}>
        Advance server clock +1 day
      </button>
      <label>
        Set server time
        <input
          type="datetime-local"
          onChange={(e) => {
            if (e.target.value) {
              setServerTime(parseLocalInputAsUTC(e.target.value));
              onChanged();
            }
          }}
        />
      </label>

      <fieldset>
        <legend>Jason's phone clock offset</legend>
        <button type="button" onClick={() => offsetJason(0)}>
          No skew
        </button>
        <button type="button" onClick={() => offsetJason(120)}>
          +2 h fast
        </button>
        <button type="button" onClick={() => offsetJason(-30)}>
          -30 min slow
        </button>
      </fieldset>

      <fieldset>
        <legend>Connectivity</legend>
        <button type="button" onClick={() => toggleOnline("Melissa")}>
          Melissa: {isOnline("Melissa") ? "Online" : "Offline"} (toggle)
        </button>
        <button type="button" onClick={() => toggleOnline("Jason")}>
          Jason: {isOnline("Jason") ? "Online" : "Offline"} (toggle)
        </button>
        <label>
          <input
            type="checkbox"
            onChange={(e) => {
              setServerUnreachable(e.target.checked);
              onChanged();
            }}
          />
          Server unreachable (offline-queue flush fails)
        </label>
      </fieldset>

      <button type="button" onClick={() => failNextDelivery()}>
        Fail the next delivery
      </button>

      {!resetConfirming ? (
        <button type="button" onClick={() => setResetConfirming(true)}>
          Reset demo data
        </button>
      ) : (
        <div role="alertdialog" aria-label="Confirm reset">
          <p>This clears everything in this demo. Continue?</p>
          <button type="button" onClick={confirmReset}>
            Yes, reset
          </button>
          <button type="button" onClick={() => setResetConfirming(false)}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
