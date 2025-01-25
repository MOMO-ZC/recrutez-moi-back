import IGeocodingProvider from "./IGeocodingProvider";

export default class GeocodingProvider implements IGeocodingProvider {
  async geocode(address: string): Promise<{ lat: number; lon: number }> {
    const fetchResult = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${address}&format=json&limit=1`
    );
    const json = await fetchResult.json();
    if (json.length === 0) {
      throw new Error("Address not found");
    }
    return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
  }
}
