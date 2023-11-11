import parallax from "../parallax";
import { gsap } from "gsap";
import { describe, it, beforeEach, vi, expect } from "vitest";

describe("parallax()", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // RAF + fake timers cause some problems, besides it is better to keep code synchronous.
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: any) =>
      cb(),
    );
  });

  it("should move plans according to cursor position", () => {
    const scene = document.createElement("div");
    const planFront = document.createElement("div");
    const planMiddle = document.createElement("div");
    const planBack = document.createElement("div");

    vi.spyOn(scene, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 1000,
    } as DOMRect);

    const destructor = parallax({
      scene,
      items: [
        {
          element: planFront,
          depth: 0,
        },
        {
          element: planMiddle,
          depth: 0.5,
        },
        {
          element: planBack,
          depth: 1,
        },
      ],
    });

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 0 }));
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(30);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(60);

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 250 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(15);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(30);

    // Nothing haas changed, values are the same (code coverage).
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 250 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(15);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(30);

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 500 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(0);

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 750 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(-15);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(-30);

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 1200 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(-30);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(-60);

    destructor();
  });

  it("should work fine after resize", () => {
    const scene = document.createElement("div");
    const planFront = document.createElement("div");
    const planMiddle = document.createElement("div");
    const planBack = document.createElement("div");

    const destructor = parallax({
      scene,
      items: [
        {
          element: planFront,
          depth: 0,
        },
        {
          element: planMiddle,
          depth: 0.5,
        },
        {
          element: planBack,
          depth: 1,
        },
      ],
    });

    let rectMock: { left: number; width: number } = {
      left: 100,
      width: 10,
    };

    vi.spyOn(scene, "getBoundingClientRect").mockImplementation(
      () => rectMock as DOMRect,
    );

    // Simulate resize.
    rectMock = { left: 0, width: 1000 };
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(100);

    // Simulate mousemove.
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 250 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(15);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(30);

    // Simulate resize.
    rectMock = { left: 0, width: 100 };
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(100);

    // Simulate mousemove.
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 75 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)[0].vars.x).to.equal(0);
    expect(gsap.getTweensOf(planMiddle)[0].vars.x).to.equal(-1.5);
    expect(gsap.getTweensOf(planBack)[0].vars.x).to.equal(-3);

    destructor();
  });

  it("should clean up after destroy", () => {
    const scene = document.createElement("div");
    const planFront = document.createElement("div");
    const planMiddle = document.createElement("div");
    const planBack = document.createElement("div");

    vi.spyOn(scene, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 1000,
    } as DOMRect);

    const destructor = parallax({
      scene,
      items: [
        {
          element: planFront,
          depth: 0,
        },
        {
          element: planMiddle,
          depth: 0.5,
        },
        {
          element: planBack,
          depth: 1,
        },
      ],
    });

    expect(scene.classList.contains("parallax")).to.true;

    destructor();

    expect(scene.classList.contains("parallax")).to.false;

    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 750 }));
    vi.advanceTimersByTime(50);
    expect(gsap.getTweensOf(planFront)).to.length(0);
    expect(gsap.getTweensOf(planMiddle)).to.length(0);
    expect(gsap.getTweensOf(planBack)).to.length(0);
  });
});
