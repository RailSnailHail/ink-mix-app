"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Ink = { id: number; name: string; shade: string; colorHex: string; stockG: number; };

export default function DeletedInksPage() {
  const [deletedInks, setDeletedInks] = useState<Ink[]>([]);
  const router = useRouter();

  async function fetchDeletedInks() {
    // We will create this API endpoint next
    const response = await fetch('/api/inks?deleted=true'); 
    if (response.ok) setDeletedInks(await response.json());
  }

  useEffect(() => { fetchDeletedInks(); }, []);

  const handleRestore = async (inkId: number) => {
    // This reuses our existing PUT endpoint
    const response = await fetch(`/api/inks/${inkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false }), // We only need to send the flag to restore
    });
    if (response.ok) {
        toast.success("Ink restored!");
        fetchDeletedInks(); // Refresh the list
    } else {
        toast.error("Failed to restore ink.");
    }
  };

  const handlePermanentDelete = async (inkId: number) => {
    // We will modify our DELETE endpoint to handle this
    const response = await fetch(`/api/inks/${inkId}?permanent=true`, { method: 'DELETE' });
    if (response.ok) {
        toast.success("Ink permanently deleted!");
        fetchDeletedInks(); // Refresh the list
    } else {
        toast.error("Failed to permanently delete ink.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deleted Ink History</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Shade</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {deletedInks.map((ink) => (
              <TableRow key={ink.id}>
                <TableCell>{ink.name}</TableCell>
                <TableCell>{ink.shade}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleRestore(ink.id)} className="mr-2">Restore</Button>
                  <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(ink.id)}>Delete Permanently</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}