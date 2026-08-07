/** The translator the engine hands each component, narrowed to what this screen uses. */
export type Translate = (key: string, vars?: Record<string, unknown>) => string;
