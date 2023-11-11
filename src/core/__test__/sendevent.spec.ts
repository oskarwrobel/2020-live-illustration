import sendEvent from "../sendevent";
import { describe, it, vi, expect } from "vitest";

describe("sendEvent", () => {
  it("should send event through ga object if it is defined (all parameters)", () => {
    const spy = vi.fn();

    (window as any).ga = spy;

    sendEvent("Category", "Action", "Label", "Value");

    expect(spy.mock.calls.length).equal(1);
    expect(spy.mock.lastCall).deep.equal([
      "send",
      "event",
      "Category",
      "Action",
      "Label",
      "Value",
    ]);
  });

  it("should send event through ga object if it is defined (required parameter)", () => {
    const spy = vi.fn();

    (window as any).ga = spy;

    sendEvent("Category", "Action");

    expect(spy.mock.calls.length).equal(1);
    expect(spy.mock.lastCall).deep.equal([
      "send",
      "event",
      "Category",
      "Action",
      undefined,
      undefined,
    ]);
  });

  it("should work fine when ga object is not defined", () => {
    expect(() => {
      sendEvent("Category", "Action");
    }).to.not.throw();
  });

  it("should work fine when ga object is not a function", () => {
    (window as any).ga = {};

    expect(() => {
      sendEvent("Category", "Action");
    }).to.not.throw();
  });
});
