import { gsap } from "gsap";
import Scenes from "../../../core/scenes";
import createClipPathElement from "../../../core/createclippathelement";

export default function oscarStatue(scenes: Scenes): () => void {
  document.querySelector("#oscar-small").addEventListener("click", () => {
    scenes.show("oscar");
  });

  createClipPathElement({
    source: "#oscar-blink-mask",
    targets: ["#oscar-blink-group"],
  });

  const tl = gsap
    .timeline({ repeat: -1, delay: 3, repeatDelay: 6 })
    .to("#oscar-blink", { y: -240, duration: 0.8, ease: "none" });

  return function oscarDestructor(): void {
    tl.kill();
  };
}
