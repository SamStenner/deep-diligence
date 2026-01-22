/**
 * Utility types used across the agent system
 */

export type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends
  (x: infer I) => void
    ? I
    : never;

export type Simplify<T> = { [K in keyof T]: T[K] };
