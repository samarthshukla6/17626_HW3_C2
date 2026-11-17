import type { Parent } from "../domain/types";

interface ViewingAsSwitchProps {
  viewer: Parent;
  onChange: (parent: Parent) => void;
}

/** A-1: mocked sign-in, a "Viewing as: Melissa | Jason" switch, always visible. */
export function ViewingAsSwitch({ viewer, onChange }: ViewingAsSwitchProps): React.ReactElement {
  return (
    <div className="viewing-as" role="group" aria-label="Viewing as">
      <span>Viewing as:</span>
      <button
        type="button"
        aria-pressed={viewer === "Melissa"}
        onClick={() => onChange("Melissa")}
      >
        Melissa
      </button>
      <button type="button" aria-pressed={viewer === "Jason"} onClick={() => onChange("Jason")}>
        Jason
      </button>
    </div>
  );
}
