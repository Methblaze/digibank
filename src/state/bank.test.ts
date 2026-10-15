import { describe, expect, it } from "vitest";
import { bankReducer, canSend, initialState, kr } from "./bank";

describe("bank", () => {
  it("sends money and never overdraws", () => {
    const s = bankReducer(initialState, { type: "send", to: "f1", from: "everyday", amount: 200 });
    expect(s.balances.everyday).toBe(5393);
    expect(s.txs[0]).toMatchObject({ label: "To Freja", amount: -200 });
    expect(bankReducer(initialState, { type: "send", to: "f1", from: "piggy", amount: 99999 })).toBe(initialState);
    expect(canSend(initialState, "everyday", 0)).toBe(false);
    expect(canSend(initialState, "everyday", 12.5)).toBe(false);
  });

  it("feeds, cracks and un-cracks the piggy", () => {
    const fed = bankReducer(initialState, { type: "feed", amount: 50 });
    expect(fed.balances).toEqual({ everyday: 5543, piggy: 1290 });
    const cracked = bankReducer(fed, { type: "crack" });
    expect(cracked.balances).toEqual({ everyday: 6833, piggy: 0 });
    expect(bankReducer(cracked, { type: "crack" })).toBe(cracked);
    const undone = bankReducer(cracked, { type: "undoCrack" });
    expect(undone.balances).toEqual(fed.balances);
    expect(undone.txs).toEqual(fed.txs);
  });

  it("freezes a card", () => {
    const s = bankReducer(initialState, { type: "toggleFreeze", cardId: "c2" });
    expect(s.cards.find((c) => c.id === "c2")?.frozen).toBe(true);
  });

  it("writes kroner the Danish way", () => {
    expect(kr(10675)).toBe("10.675 kr.");
    expect(kr(-86)).toBe("−86 kr.");
  });
});
