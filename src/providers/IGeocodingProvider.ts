/**
 * Represents a geocoding provider.
 */
export default interface IGeocodingProvider {
  /**
   * Geocodes an address.
   * @param address The address to geocode.
   */
  geocode(address: string): Promise<{ lat: number; lon: number }>;
}
