import escHandler from "../eschandler";
import { describe, it, vi, expect } from "vitest";

describe("escHandler", () => {
  it("should handle esc key press", () => {
    const spy = vi.fn();
    const destructor = escHandler(spy);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(spy.mock.calls.length).equal(0);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(spy.mock.calls.length).equal(1);
    expect(spy.mock.calls[0][0]).instanceof(KeyboardEvent);

    destructor();
  });

  it("should return destructor function to detach event", () => {
    const spy = vi.fn();
    const destructor = escHandler(spy);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy.mock.calls.length).equal(1);

    destructor();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy.mock.calls.length).equal(1); // Still once.
  });
});
