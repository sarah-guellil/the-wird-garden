import { Character, Daisy, Rose } from "./Character";

// Aya: te acompaña con el Corán (onboarding, plan, memorización y repasos)
export function Aya({ size, talkingMs }: { size?: number; talkingMs?: number }) {
  return (
    <Character
      id="aya"
      size={size}
      talkingMs={talkingMs}
      colors={{
        background: "#E8EFE6",
        hijab: "#F6DDE3",
        hijabInner: "#E7BFCB",
        dress: "#8FA98B",
      }}
    >
      <Daisy x={39} y={42} scale={0.8} />
      <Rose x={81} y={38} />
    </Character>
  );
}