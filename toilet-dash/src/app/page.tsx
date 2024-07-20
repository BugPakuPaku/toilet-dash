import MapProvider from "@/providers/map-provider";
import { MapComponent } from "@/components/map";

export default function Page() {
  return (
    <MapProvider>
      <MapComponent/>
    </MapProvider>
  );
}
