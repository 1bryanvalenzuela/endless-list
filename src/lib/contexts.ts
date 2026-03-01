export const DESCRIPTION_CONTEXT_KEY = Symbol('description-context');

export interface DescriptionContext {
    save: () => void;
}
