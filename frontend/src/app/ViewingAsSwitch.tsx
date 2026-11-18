import type { Parent } from "../domain/types";
import { Avatar } from "./ui/Avatar";

interface ViewingAsSwitchProps {
  viewer: Parent;
  onChange: (parent: Parent) => void;
}

/** A-1: mocked sign-in, a "Viewing as: Melissa | Jason" switch, always visible. */
export function ViewingAsSwitch({ viewer, onChange }: ViewingAsSwitchProps): React.ReactElement {
  return (
    <div className="viewing-as" role="group" aria-label="Viewing as">
      <strong className="viewing-as__current">Current parent: {viewer}</strong>
      <div className="viewing-as__options">
        {(["Melissa", "Jason"] as const).map((parent) => (
          <button
            key={parent}
            type="button"
            aria-pressed={viewer === parent}
            className={`viewing-as__option${viewer === parent ? " viewing-as__selected" : ""}`}
            onClick={() => onChange(parent)}
          >
            <Avatar parent={parent} size={30} />
            {parent}
          </button>
        ))}
      </div>
    </div>
  );
}
