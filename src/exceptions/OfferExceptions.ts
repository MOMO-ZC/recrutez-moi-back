export class OfferNotFoundError extends Error {
  constructor(message?: string) {
    super(message || "Offer not found");
    this.name = "OfferNotFoundError";
  }
}
