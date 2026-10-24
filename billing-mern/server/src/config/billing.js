// Settings read from environment variables, with safe defaults
export const TAX_RATE = Number(process.env.TAX_RATE ?? 5);
export const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

// Round to 2 decimal places for money
export const round2 = (n) => Math.round(n * 100) / 100;
