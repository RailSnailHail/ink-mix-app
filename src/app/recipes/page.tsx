"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMixStore, type Recipe } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RecipesPage() {
  // --- THIS IS THE CORRECT LOCATION FOR HOOKS ---
  const router = useRouter();
  const setActiveRecipe = useMixStore((state) => state.setActiveRecipe);
  
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShade, setSelectedShade] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setAllRecipes(data);
        setFilteredRecipes(data);
      }
    }
    fetchRecipes();
  }, []);

  const availableShades = useMemo(() => {
    const shades = new Set<string>();
    allRecipes.forEach(recipe => {
      recipe.components.forEach(comp => {
        if (comp.Ink.shade) shades.add(comp.Ink.shade);
      });
    });
    return Array.from(shades).sort();
  }, [allRecipes]);

  useEffect(() => {
    let results = allRecipes;
    if (selectedShade) {
      results = results.filter(recipe => 
        recipe.components.some(comp => comp.Ink.shade === selectedShade)
      );
    }
    if (searchTerm) {
      results = results.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRecipes(results);
  }, [searchTerm, allRecipes, selectedShade]);

  const handleRemix = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    router.push('/mixes');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recipe Book</h1>
        <Input
          placeholder="Search recipes..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={!selectedShade ? 'default' : 'outline'}
          onClick={() => setSelectedShade(null)}
          className="cursor-pointer"
        >
          All
        </Badge>
        {availableShades.map(shade => (
          <Badge
            key={shade}
            variant={selectedShade === shade ? 'default' : 'outline'}
            onClick={() => setSelectedShade(shade)}
            className="cursor-pointer"
          >
            {shade}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader>
              <CardTitle className="truncate">{recipe.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-24 rounded-md border mb-4" style={{ backgroundColor: recipe.swatchHex }} />
              <div className="space-y-1 text-sm">
                <h4 className="font-semibold">Components:</h4>
                {recipe.components.map((comp) => (
                  <div key={comp.Ink.id} className="flex justify-between">
                    <span>{comp.Ink.name}</span>
                    <span className="text-muted-foreground">{(comp.ratio * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" onClick={() => handleRemix(recipe)}>
                Re-mix This Color
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No recipes found.</p>
        </div>
      )}
    </div>
  );
}