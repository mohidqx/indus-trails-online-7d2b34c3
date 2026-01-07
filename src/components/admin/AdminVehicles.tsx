import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/common/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_day: number;
  features: string[] | null;
  image_url: string | null;
  is_available: boolean;
}

const emptyVehicle = {
  name: '',
  type: '',
  capacity: 4,
  price_per_day: 0,
  features: [] as string[],
  image_url: '',
  is_available: true,
};

export default function AdminVehicles() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<typeof emptyVehicle & { id?: string }>(emptyVehicle);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVehicles(data);
    }
    setIsLoading(false);
  };

  const saveVehicle = async () => {
    const vehicleData = {
      name: editingVehicle.name,
      type: editingVehicle.type,
      capacity: editingVehicle.capacity,
      price_per_day: editingVehicle.price_per_day,
      features: editingVehicle.features || [],
      image_url: editingVehicle.image_url || null,
      is_available: editingVehicle.is_available,
    };

    let error;
    if (editingVehicle.id) {
      ({ error } = await supabase.from('vehicles').update(vehicleData).eq('id', editingVehicle.id));
    } else {
      ({ error } = await supabase.from('vehicles').insert(vehicleData));
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save vehicle', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Vehicle ${editingVehicle.id ? 'updated' : 'created'}` });
      setIsEditing(false);
      setEditingVehicle(emptyVehicle);
      fetchVehicles();
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    const { error } = await supabase.from('vehicles').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete vehicle', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Vehicle deleted' });
      fetchVehicles();
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setEditingVehicle({
        ...editingVehicle,
        features: [...(editingVehicle.features || []), featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setEditingVehicle({
      ...editingVehicle,
      features: editingVehicle.features?.filter((_, i) => i !== index) || [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{vehicles.length} vehicles</p>
        <Button onClick={() => { setEditingVehicle(emptyVehicle); setIsEditing(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
        </Button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {vehicle.image_url ? (
                <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground">No image</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingVehicle(vehicle); setIsEditing(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteVehicle(vehicle.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 rounded bg-muted">{vehicle.capacity} passengers</span>
                <span className={`px-2 py-1 rounded ${vehicle.is_available ? 'bg-emerald/10 text-emerald' : 'bg-destructive/10 text-destructive'}`}>
                  {vehicle.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">
                PKR {vehicle.price_per_day.toLocaleString()}/day
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVehicle.id ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={editingVehicle.name}
                onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                placeholder="Vehicle name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type *</label>
                <Input
                  value={editingVehicle.type}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                  placeholder="e.g., SUV"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Capacity *</label>
                <Input
                  type="number"
                  value={editingVehicle.capacity}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Price Per Day (PKR) *</label>
              <Input
                type="number"
                value={editingVehicle.price_per_day}
                onChange={(e) => setEditingVehicle({ ...editingVehicle, price_per_day: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={editingVehicle.image_url || null}
                onChange={(url) => setEditingVehicle({ ...editingVehicle, image_url: url || '' })}
                folder="vehicles"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Features</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., AC, 4x4"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingVehicle.features?.map((item, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
                    {item}
                    <button onClick={() => removeFeature(i)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingVehicle.is_available}
                onChange={(e) => setEditingVehicle({ ...editingVehicle, is_available: e.target.checked })}
              />
              Available for booking
            </label>
            <div className="flex gap-2 pt-4">
              <Button onClick={saveVehicle} disabled={!editingVehicle.name || !editingVehicle.type || !editingVehicle.price_per_day}>
                {editingVehicle.id ? 'Update' : 'Create'} Vehicle
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
