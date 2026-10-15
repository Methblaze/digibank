// The demo bank: two accounts, a savings goal, a few cards and friends.
// Everything lives in memory; reloading the page starts over.

export type AccountId = "everyday" | "piggy";

export type Tx = {
  id: string;
  label: string;
  /** Kroner; negative is money going out of the everyday account */
  amount: number;
  kind: "shop" | "fun" | "travel" | "income" | "friend" | "piggy";
  when: string;
};

export type Card = {
  id: string;
  name: string;
  last4: string;
  kind: "Debit" | "Travel" | "Online";
  frozen: boolean;
};

export type Friend = { id: string; name: string; hue: number };

export type BankState = {
  balances: Record<AccountId, number>;
  goal: { name: string; target: number };
  txs: Tx[];
  cards: Card[];
  friends: Friend[];
  /** Piggy savings taken out by the last crack, kept so it can be undone */
  lastCrack: number | null;
};

export const initialState: BankState = {
  balances: { everyday: 5593, piggy: 1240 },
  goal: { name: "New headphones", target: 1500 },
  txs: [
    { id: "t1", label: "Pocket money", amount: 400, kind: "income", when: "Today" },
    { id: "t2", label: "Corner shop", amount: -86, kind: "shop", when: "Today" },
    { id: "t3", label: "Cinema with Freja", amount: -120, kind: "fun", when: "Yesterday" },
    { id: "t4", label: "Bus pass", amount: -375, kind: "travel", when: "Mon" },
    { id: "t5", label: "Part-time job", amount: 2150, kind: "income", when: "Fri" },
  ],
  cards: [
    { id: "c1", name: "Everyday card", last4: "4821", kind: "Debit", frozen: false },
    { id: "c2", name: "Travel card", last4: "1937", kind: "Travel", frozen: false },
    { id: "c3", name: "Online card", last4: "5502", kind: "Online", frozen: false },
  ],
  friends: [
    { id: "f1", name: "Freja", hue: 330 },
    { id: "f2", name: "Oliver", hue: 200 },
    { id: "f3", name: "Mum", hue: 150 },
    { id: "f4", name: "Noah", hue: 30 },
  ],
  lastCrack: null,
};

export type Action =
  | { type: "send"; to: string; from: AccountId; amount: number }
  | { type: "feed"; amount: number }
  | { type: "crack" }
  | { type: "undoCrack" }
  | { type: "toggleFreeze"; cardId: string }
  | { type: "reset" };

let nextId = 100;
const id = () => `t${nextId++}`;

export function canSend(state: BankState, from: AccountId, amount: number) {
  return Number.isInteger(amount) && amount > 0 && amount <= state.balances[from];
}

export function bankReducer(state: BankState, action: Action): BankState {
  switch (action.type) {
    case "send": {
      if (!canSend(state, action.from, action.amount)) return state;
      const friend = state.friends.find((f) => f.id === action.to);
      return {
        ...state,
        balances: { ...state.balances, [action.from]: state.balances[action.from] - action.amount },
        txs: [
          { id: id(), label: `To ${friend?.name ?? "a friend"}`, amount: -action.amount, kind: "friend", when: "Just now" },
          ...state.txs,
        ],
        lastCrack: null,
      };
    }
    case "feed": {
      if (action.amount <= 0 || action.amount > state.balances.everyday) return state;
      return {
        ...state,
        balances: { everyday: state.balances.everyday - action.amount, piggy: state.balances.piggy + action.amount },
        txs: [{ id: id(), label: "Fed the piggy", amount: -action.amount, kind: "piggy", when: "Just now" }, ...state.txs],
        lastCrack: null,
      };
    }
    case "crack": {
      const saved = state.balances.piggy;
      if (saved <= 0) return state;
      return {
        ...state,
        balances: { everyday: state.balances.everyday + saved, piggy: 0 },
        txs: [{ id: id(), label: "Cracked the piggy", amount: saved, kind: "piggy", when: "Just now" }, ...state.txs],
        lastCrack: saved,
      };
    }
    case "undoCrack": {
      if (state.lastCrack == null) return state;
      const [, ...rest] = state.txs;
      return {
        ...state,
        balances: { everyday: state.balances.everyday - state.lastCrack, piggy: state.lastCrack },
        txs: rest,
        lastCrack: null,
      };
    }
    case "toggleFreeze":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.cardId ? { ...c, frozen: !c.frozen } : c)),
      };
    case "reset":
      return initialState;
  }
}

const groups = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });
/** Danish kroner the way the 2019 design wrote them: 10.675 kr. */
export const kr = (n: number) => `${n < 0 ? "−" : ""}${groups.format(Math.abs(Math.round(n)))} kr.`;
