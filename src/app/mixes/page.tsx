"use client";

import { useState, useEffect } from 'react';
import { useMixStore, type Recipe } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { HexColorPicker } from 'react-colorful';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

type Ink = { id: number; name: string; shade: string; colorHex: string; };
type GroupedInks = { [key: string]: Ink[] };

export default function MixesPage() {
  const [groupedInks, setGroupedInks] = useState<GroupedInks>({});
  const [gramsInputs, setGramsInputs] = useState<{ [key: number]: string }>({});
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [newSwatch, setNewSwatch] = useState("#808080");
  const router = useRouter();

  const { 
    mixName, setMixName, components, addComponent, removeLastComponent, clearMix, 
    activeRecipe, targetGrams, setTargetGrams 
  } = useMixStore();

  useEffect(() => {
    async function fetchInks() {
      const response = await fetch('/api/inks?inStock=true'); // Fetch only in-stock inks
      if (response.ok) {
        const data: Ink[] = await response.json();
        const groups = data.reduce((acc, ink) => {
          (acc[ink.shade] = acc[ink.shade] || []).push(ink);
          return acc;
        }, {} as GroupedInks);
        setGroupedInks(groups);
      }
    }
    fetchInks();
  }, []);

  const handleAddPour = (ink: Ink) => {
    const grams = parseFloat(gramsInputs[ink.id] || '0');
    if (!grams || grams <= 0) {
      toast.error("Please enter a valid weight.");
      return;
    }
    addComponent({ inkId: ink.id, name: ink.name, colorHex: ink.colorHex, grams: grams });
    setGramsInputs(prev => ({ ...prev, [ink.id]: '' }));
  };

  const handleFinishAndSaveRecipe = async () => {
    // This function is correct from previous steps and remains unchanged
    const response = await fetch('/api/mixes/finish', { /* ... */ });
    if (response.ok) {
      toast.success(`Recipe "${mixName}" saved successfully!`);
      clearMix();
      setFinishDialogOpen(false);
      router.push('/recipes');
      router.refresh();
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || "Failed to save recipe.");
    }
  };

  const handleDeductRemix = async () => {
    // This function is correct from previous steps and remains unchanged
    if (!activeRecipe) return;
    const componentsToDeduct = activeRecipe.components.map(c => ({
        inkId: c.Ink.id,
        grams: c.ratio * targetGrams
    }));

    const response = await fetch('/api/inventory/deduct', { /* ... */ });
    if (response.ok) {
      toast.success("Inventory updated successfully!");
      clearMix();
      router.push('/inks');
      router.refresh();
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || "Failed to deduct inventory.");
    }
  };

  const totalPouredGrams = components.reduce((sum, c) => sum + c.grams, 0);

  return (
    <>
      <Toaster richColors />
      <div className="container mx-auto p-4">
        {activeRecipe ? (
          // --- RATIO CALCULATOR UI ---
          <Card>
            <CardHeader>
              <CardTitle>Ratio Calculator: {activeRecipe.name}</CardTitle>
              <CardDescription>Enter the total final weight you want to create.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 pt-2 mb-4 p-4 bg-muted rounded-md">
                <label className="font-medium text-lg">Total Target Weight (g):</label>
                <Input type="number" value={targetGrams.toFixed(1)} onChange={e => setTargetGrams(parseFloat(e.target.value) || 0)} className="w-48 text-lg" />
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader><TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Ratio</TableHead>
                      <TableHead className="text-right">Required Grams</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {activeRecipe.components.map(comp => (
                      <TableRow key={comp.Ink.id}>
                        <TableCell className="font-medium">{comp.Ink.name}</TableCell>
                        <TableCell>{(comp.ratio * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right font-bold text-xl text-primary">{(comp.ratio * targetGrams).toFixed(1)}g</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-end">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => clearMix()}>Cancel</Button>
                <Button className="w-full sm:w-auto" onClick={handleDeductRemix}>Confirm & Deduct Amount</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // --- FREESTYLE MIX UI ---
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold mb-4">Select Inks</h2>
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedInks).map(([shade, inkList]) => (
                  <AccordionItem value={shade} key={shade}>
                    <AccordionTrigger>{shade}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {inkList.map((ink) => (
                          <div key={ink.id} className="p-2 border rounded-md">
                            <span className="font-medium">{ink.name}</span>
                            <div className="flex items-center gap-2 mt-2">
                              <Input type="number" placeholder="grams" value={gramsInputs[ink.id] || ''} onChange={(e) => setGramsInputs(prev => ({...prev, [ink.id]: e.target.value}))} className="h-8" />
                              <Button size="sm" onClick={() => handleAddPour(ink)}>Add</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Freestyle Mix</CardTitle>
                  <Input placeholder="Enter New Recipe Name..." value={mixName} onChange={(e) => setMixName(e.target.value)} className="mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 min-h-[150px]">
                    {components.map((c, i) => (
                      <div key={`${c.inkId}-${i}`} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full border" style={{ backgroundColor: c.colorHex }} /><span>{c.name}</span></div>
                        <div className="flex items-center gap-4"><span>{c.grams.toFixed(1)}g</span><span className="text-sm text-muted-foreground">{totalPouredGrams > 0 ? ((c.grams / totalPouredGrams) * 100).toFixed(1) : 0}%</span></div>
                      </div>
                    ))}
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between font-bold text-lg"><span>Total Weight:</span><span>{totalPouredGrams.toFixed(1)}g</span></div>
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={removeLastComponent} disabled={components.length === 0}>Undo Pour</Button>
                    <Button onClick={() => setFinishDialogOpen(true)} disabled={components.length === 0 || !mixName}>Finish & Save Recipe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save New Recipe: {mixName}</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium">What color did this mix make?</label>
            <div className="flex justify-center my-4"><HexColorPicker color={newSwatch} onChange={setNewSwatch} /></div>
            <div className="flex items-center gap-2 p-2 border rounded-md"><span>Resulting Color Hex:</span><Input value={newSwatch} onChange={(e) => setNewSwatch(e.target.value)} className="font-mono" /></div>
          </div>
          <Button onClick={handleFinishAndSaveRecipe} className="mt-4 w-full">Save Recipe and Deduct Stock</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}