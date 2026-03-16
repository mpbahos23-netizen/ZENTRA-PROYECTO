import { useParams } from 'react-router-dom';
import ShipperSearching from '@/components/realtime/ShipperSearching';

// ============================================
// ShipmentStatus: Wrapper page for shipment tracking
// Routes to ShipperSearching which handles all states
// ============================================
export default function ShipmentStatus() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>ID de envío no encontrado</p>
      </div>
    );
  }

  return <ShipperSearching shipmentId={id} />;
}
