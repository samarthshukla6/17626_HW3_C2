import type { Parent } from "../domain/types";

interface ViewingAsSwitchProps {
  viewer: Parent;
  onChange: (parent: Parent) => void;
}

/** A-1: mocked sign-in, a "Viewing as: Melissa | Jason" switch, always visible. */
export function ViewingAsSwitch({ viewer, onChange }: ViewingAsSwitchProps): React.ReactElement {
  return (
    <div className="viewing-as" role="group" aria-label="Viewing as">
      <strong className="viewing-as__current">Current parent: {viewer}</strong>
      <button
        type="button"
        aria-pressed={viewer === "Melissa"}
        className={viewer === "Melissa" ? "viewing-as__selected" : undefined}
        onClick={() => onChange("Melissa")}
      >
        Melissa
      </button>
      <button
        type="button"
        aria-pressed={viewer === "Jason"}
        className={viewer === "Jason" ? "viewing-as__selected" : undefined}
        onClick={() => onChange("Jason")}
      >
        Jason
      </button>
    </div>
  );
}
