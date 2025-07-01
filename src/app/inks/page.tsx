"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

type Ink = { id: number; name: string; shade: string; colorHex: string; stockG: number; };

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name requires at least 2 characters."),
  shade: z.string().min(2, "Shade requires at least 2 characters."),
  colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex code like #RRGGBB"),
  stockG: z.coerce.number().min(0, "Stock must be 0 or greater."),
});

export default function InksPage() {
  const [inks, setInks] = useState<Ink[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInk, setSelectedInk] = useState<Ink | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const form = useForm<z.infer<typeof formSchema>>();

  async function fetchInks() {
    const response = await fetch('/api/inks');
    if (response.ok) setInks(await response.json());
  }

  useEffect(() => { fetchInks(); }, []);

  const handleAddNew = () => {
    form.reset({ name: "", shade: "", colorHex: "#ffffff", stockG: 0 });
    setIsEditing(false);
    setConfirmText("");
    setDialogOpen(true);
  };

  const handleEdit = (ink: Ink) => {
    form.reset(ink);
    setIsEditing(true);
    setConfirmText("");
    setDialogOpen(true);
  };

  const handleDeleteRequest = (ink: Ink) => {
    setSelectedInk(ink);
    setConfirmText("");
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedInk || confirmText !== "Delete") return toast.error("You must type 'Delete' to confirm.");
    
    const response = await fetch(`/api/inks/${selectedInk.id}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success(`Ink "${selectedInk.name}" has been deleted.`);
      fetchInks();
      setDeleteDialogOpen(false);
      setSelectedInk(null);
    } else {
      toast.error("Failed to delete ink.");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing && confirmText !== "Update") return toast.error("You must type 'Update' to confirm changes.");

    const url = isEditing ? `/api/inks/${values.id}` : '/api/inks';
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      toast.success(isEditing ? "Ink updated!" : "Ink created!");
      fetchInks();
      setDialogOpen(false);
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || "An unknown error occurred.");
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ink Inventory</h1>
        <Button onClick={handleAddNew}>New Ink</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? 'Edit Ink' : 'Add New Ink'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Ink Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="shade" render={({ field }) => ( <FormItem><FormLabel>Shade Family</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="colorHex" render={({ field }) => ( <FormItem><FormLabel>Color</FormLabel><FormControl><Input type="color" {...field} className="w-full h-10" /></FormControl><FormMessage /></FormItem> )}/>
              <FormField control={form.control} name="stockG" render={({ field }) => ( <FormItem><FormLabel>Stock (grams)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem> )}/>
              {isEditing && (
                <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-md">
                  <FormLabel>To confirm changes, type "Update" below:</FormLabel>
                  <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-2" placeholder='Type "Update" to enable save'/>
                </div>
              )}
              <Button type="submit">Save</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Are you absolutely sure?</DialogTitle></DialogHeader>
          <DialogDescription>This will hide the ink from all lists. To proceed, type "Delete" below.</DialogDescription>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="my-2" placeholder='Type "Delete" to confirm'/>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== "Delete"}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border rounded-md">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Shade</TableHead><TableHead>Color</TableHead><TableHead className="text-right">Stock (g)</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {inks.map((ink) => (
              <TableRow key={ink.id}>
                <TableCell>{ink.name}</TableCell><TableCell>{ink.shade}</TableCell>
                <TableCell><div className="flex items-center gap-2"><div className="h-6 w-6 rounded-full border" style={{ backgroundColor: ink.colorHex }}></div><span>{ink.colorHex}</span></div></TableCell>
                <TableCell className="text-right">{ink.stockG.toFixed(1)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(ink)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteRequest(ink)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}