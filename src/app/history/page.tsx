"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

type Item = { id: number; name: string; shade?: string; swatchHex?: string; };

export default function HistoryPage() {
  const [deletedInks, setDeletedInks] = useState<Item[]>([]);
  const [deletedRecipes, setDeletedRecipes] = useState<Item[]>([]);

  const fetchDeleted = async () => {
    const inksRes = await fetch('/api/inks?deleted=true');
    if (inksRes.ok) setDeletedInks(await inksRes.json());

    const recipesRes = await fetch('/api/recipes?deleted=true');
    if (recipesRes.ok) setDeletedRecipes(await recipesRes.json());
  };

  useEffect(() => { fetchDeleted(); }, []);

  const handleRestore = async (item: Item, type: 'ink' | 'recipe') => {
    const response = await fetch(`/api/${type}s/${item.id}`, { method: 'PATCH' });
    if (response.ok) {
      toast.success(`${type === 'ink' ? 'Ink' : 'Recipe'} "${item.name}" restored!`);
      fetchDeleted();
    } else {
      toast.error(`Failed to restore ${type}.`);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">History & Deleted Items</h1>
      <Card>
        <CardHeader><CardTitle>Deleted Inks</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {deletedInks.map((ink) => (
                <TableRow key={`ink-${ink.id}`}>
                  <TableCell>{ink.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(ink, 'ink')}>Restore</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Deleted Recipes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {deletedRecipes.map((recipe) => (
                <TableRow key={`recipe-${recipe.id}`}>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(recipe, 'recipe')}>Restore</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}