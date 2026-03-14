'use client';

import { useState } from 'react';
import { useArchitectureStore } from '@/stores/architecture-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSampleArchitecture } from '@/lib/sample-architecture';
import { getDiscordArchitecture, getUberArchitecture, getNetflixArchitecture, getAmazonArchitecture, getStripeArchitecture } from '@/lib/sample-architectures';

export function CanvasToolbar() {
  const [sampleType, setSampleType] = useState<string>('ecommerce');
  const { architectureName, setArchitectureName, nodes, edges, loadArchitecture, clearArchitecture } =
    useArchitectureStore();

  const handleSave = () => {
    const data = JSON.stringify({ nodes, edges, name: architectureName });
    localStorage.setItem('system-vis-architecture', data);

    // Also save to list
    const savedList = JSON.parse(localStorage.getItem('system-vis-saved-list') || '[]');
    const entry = { id: Date.now().toString(), name: architectureName, savedAt: new Date().toISOString() };
    localStorage.setItem('system-vis-saved-list', JSON.stringify([entry, ...savedList.slice(0, 9)]));
  };

  const handleLoad = () => {
    const data = localStorage.getItem('system-vis-architecture');
    if (data) {
      const parsed = JSON.parse(data);
      loadArchitecture(parsed.nodes, parsed.edges, parsed.name);
    }
  };

  const handleLoadSample = (type: string) => {
    let nodes, edges, name;

    if (type === 'discord') {
      const arch = getDiscordArchitecture();
      nodes = arch.nodes;
      edges = arch.edges;
      name = arch.name;
    } else if (type === 'uber') {
      const arch = getUberArchitecture();
      nodes = arch.nodes;
      edges = arch.edges;
      name = arch.name;
    } else if (type === 'netflix') {
      const arch = getNetflixArchitecture();
      nodes = arch.nodes;
      edges = arch.edges;
      name = arch.name;
    } else if (type === 'stripe') {
      const arch = getStripeArchitecture();
      nodes = arch.nodes;
      edges = arch.edges;
      name = arch.name;
    } else {
      // ecommerce (Amazon) is default
      const arch = getAmazonArchitecture();
      nodes = arch.nodes;
      edges = arch.edges;
      name = arch.name;
    }

    loadArchitecture(nodes, edges, name);
    setArchitectureName(name);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ nodes, edges, name: architectureName }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${architectureName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2">
      <Input
        value={architectureName}
        onChange={(e) => setArchitectureName(e.target.value)}
        className="w-56 h-8 text-sm bg-card"
      />

      <Select onValueChange={(value: string | null) => { if (value) { setSampleType(value); handleLoadSample(value); } }}>
        <SelectTrigger className="w-48 h-8 text-sm">
          <SelectValue placeholder="Load sample architecture" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ecommerce">E-Commerce (Amazon)</SelectItem>
          <SelectItem value="discord">Chat (Discord)</SelectItem>
          <SelectItem value="uber">Ride Sharing (Uber)</SelectItem>
          <SelectItem value="netflix">Streaming (Netflix)</SelectItem>
          <SelectItem value="stripe">Payment (Stripe)</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleSave}>
        Save
      </Button>
      <Button variant="outline" size="sm" onClick={handleLoad}>
        Load
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportJSON}>
        Export
      </Button>
      <div className="flex-1" />
      <Button variant="destructive" size="sm" onClick={clearArchitecture}>
        Clear
      </Button>
    </div>
  );
}
