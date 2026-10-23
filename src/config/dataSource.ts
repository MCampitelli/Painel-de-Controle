export type DataSource = "mock" | "real";

// Keep mock data isolated during development and set to real for production usage.
export const DATA_SOURCE: DataSource = "real";
