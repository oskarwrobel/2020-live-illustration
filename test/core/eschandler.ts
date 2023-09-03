import { expect } from "chai";
import escHandler from "../../src/core/eschandler";

describe("escHandler", () => {
  it("should handle esc key press", () => {
    const spy = jest.fn();
    const destructor = escHandler(spy);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(spy.mock.calls.length).equal(0);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(spy.mock.calls.length).equal(1);
    expect(spy.mock.calls[0][0]).instanceof(KeyboardEvent);

    destructor();
  });

  it("should return destructor function to detach event", () => {
    const spy = jest.fn();
    const destructor = escHandler(spy);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy.mock.calls.length).equal(1);

    destructor();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(spy.mock.calls.length).equal(1); // Still once.
  });
});
