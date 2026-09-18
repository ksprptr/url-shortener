/**
 * The `X-Forwarded-For` chain to hand the API, or null when there is nothing trustworthy to forward.
 **/
// Verbatim: the API's `trust proxy` counts back to our proxy's entry, so never append to the chain.
export const forwardedForHeader = (headersList: Headers): string | null =>
  headersList.get('x-forwarded-for');
