"use client";

import { useState, useEffect } from 'react';
import { useMixStore, Recipe } from '@/lib/store';
import { useRouter } from 'next/navigation';
// ... (keep all other imports from the previous version: Accordion, Button, Card, etc.)
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { HexColorPicker } from 'react-colorful';
import Link from 'next/link';

type Ink = { id: number; name: string; shade: string; colorHex: string; };
type GroupedInks = { [key: string]: Ink[] };

export default function MixesPage() {
  // --- All state and store hooks ---
  const [groupedInks, setGroupedInks] = useState<GroupedInks>({});
  const [gramsInputs, setGramsInputs] = useState<{ [key: number]: string }>({});
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [newSwatch, setNewSwatch] = useState("#808080");
  const router = useRouter();
  const { 
    mixName, setMixName, components, addComponent, removeLastComponent, clearMix, 
    activeRecipe, targetGrams, setTargetGrams 
  } = useMixStore();

  // --- All handlers and useEffects ---
  useEffect(() => { /* ... fetchInks logic is identical ... */
    async function fetchInks() {
      const response = await fetch('/api/inks');
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

  const handleAddPour = (inkId: number, inkName: string, inkColor: string, gramsValue: string) => {
    const grams = parseFloat(gramsValue);
    if (!grams || grams <= 0) return toast.error("Please enter a valid weight.");
    addComponent({ inkId, name: inkName, colorHex: inkColor, grams });
    setGramsInputs(prev => ({ ...prev, [inkId]: '' }));
  };

  const handleFinishMix = async () => { /* ... this logic is identical ... */ 
    const response = await fetch('/api/mixes/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mixName, components, swatchHex: newSwatch }),
    });
    if (response.ok) {
      toast.success(`Recipe "${mixName}" saved successfully!`);
      clearMix();
      setFinishDialogOpen(false);
      router.push('/recipes');
    } else {
      toast.error("Failed to save mix. Please try again.");
    }
  };

  const totalPouredGrams = components.reduce((sum, c) => sum + c.grams, 0);

  // --- This is the JSX for the page ---
  return (
    <>
      <Toaster richColors />
      <div className="container mx-auto p-4">
        {/* CONDITIONAL UI: RENDER BASED ON MODE */}
        {activeRecipe ? (
          // --- RATIO CALCULATOR MODE ---
          <Card>
            <CardHeader>
              <CardTitle>Re-mixing: {activeRecipe.name}</CardTitle>
              <CardDescription>Enter a total target weight and add each component.</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <label>Total Weight (g):</label>
                <Input type="number" value={targetGrams} onChange={e => setTargetGrams(parseFloat(e.target.value) || 0)} className="w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeRecipe.components.map(comp => {
                  const target = comp.ratio * targetGrams;
                  const poured = components.find(p => p.inkId === comp.Ink.id)?.grams || 0;
                  const remaining = target - poured;
                  return (
                    <div key={comp.Ink.id} className="p-3 border rounded-md">
                      <div className="flex justify-between font-medium">
                        <span>{comp.Ink.name}</span>
                        <span>Target: {target.toFixed(1)}g</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>Poured: {poured.toFixed(1)}g</span>
                        <span className="px-2">|</span>
                        <span className={remaining > 0.1 ? 'text-blue-600' : 'text-green-600'}>
                          {remaining > 0.1 ? `Add ${remaining.toFixed(1)}g` : 'Complete'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" placeholder="add grams..." value={gramsInputs[comp.Ink.id] || ''} onChange={e => setGramsInputs(prev => ({...prev, [comp.Ink.id]: e.target.value}))} />
                        <Button onClick={() => handleAddPour(comp.Ink.id, comp.Ink.name, comp.Ink.colorHex, gramsInputs[comp.Ink.id] || '0')}>Add Pour</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <hr className="my-4"/>
              <div className="flex justify-between font-bold text-lg"><span>Total Poured:</span><span>{totalPouredGrams.toFixed(1)}g / {targetGrams.toFixed(1)}g</span></div>
              <Button className="w-full mt-4" onClick={() => toast.success("Historical mix logged!")}>Log this Mix (No Inventory Deduction)</Button>
            </CardContent>
          </Card>
        ) : (
          // --- FREESTYLE MIX MODE ---
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1"> {/* Ink Picker */}
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
                              <Button size="sm" onClick={() => handleAddPour(ink.id, ink.name, ink.colorHex, gramsInputs[ink.id] || '0')}>Add</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div className="md:col-span-2"> {/* Current Mix Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Freestyle Mix</CardTitle>
                  <Input placeholder="Enter New Recipe Name..." value={mixName} onChange={(e) => setMixName(e.target.value)} className="mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 min-h-[150px]">
                    {components.map((c, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div className="flex items-center gap-2"><div className="h-5 w-5 rounded-full border" style={{ backgroundColor: c.colorHex }} /><span>{c.name}</span></div>
                        <div className="flex items-center gap-4"><span>{c.grams.toFixed(1)}g</span><span className="text-sm text-muted-foreground">{totalPouredGrams > 0 ? ((c.grams / totalPouredGrams) * 100).toFixed(1) : 0}%</span></div>
                      </div>
                    ))}
                  </div>
                  <hr className="my-4" /><div className="flex justify-between font-bold text-lg"><span>Total Weight:</span><span>{totalPouredGrams.toFixed(1)}g</span></div>
                  <div className="flex flex-wrap justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={removeLastComponent} disabled={components.length === 0}>Undo</Button>
                    <Button onClick={() => setFinishDialogOpen(true)} disabled={components.length === 0 || !mixName}>Finish & Save Recipe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* FINISH MIX DIALOG (This is the same as before) */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Save New Recipe: {mixName}</DialogTitle></DialogHeader>
          <div>
            <label className="text-sm font-medium">What color did this mix make?</label>
            <div className="flex justify-center my-4"><HexColorPicker color={newSwatch} onChange={setNewSwatch} /></div>
            <div className="flex items-center gap-2 p-2 border rounded-md"><span>Resulting Color Hex:</span><Input value={newSwatch} onChange={(e) => setNewSwatch(e.target.value)} className="font-mono" /></div>
          </div>
          <Button onClick={handleFinishMix} className="mt-4 w-full">Save Recipe and Deduct Stock</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}