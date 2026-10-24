// Currency symbol. Change here to update the whole app.
export const money = (n) => `₹${Number(n).toFixed(2)}`;

export const round2 = (n) => Math.round(n * 100) / 100;
