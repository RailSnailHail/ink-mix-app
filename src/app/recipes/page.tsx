"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMixStore, type Recipe } from '@/lib/store'; // Assuming Recipe type is exported from store
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RecipesPage() {
  // --- HOOKS ARE CORRECTLY PLACED HERE, INSIDE THE COMPONENT ---
  const router = useRouter();
  const setActiveRecipe = useMixStore((state) => state.setActiveRecipe);

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    const results = allRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(results);
  }, [searchTerm, allRecipes]);

  const handleRemix = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    router.push('/mixes');
  };

  return (
    // The JSX for this component is unchanged from the last correct version.
    // It begins here...
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader><CardTitle className="truncate">{recipe.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="w-full h-24 rounded-md border mb-4" style={{ backgroundColor: recipe.swatchHex }} />
              <div className="space-y-1 text-sm">
                <h4 className="font-semibold">Components:</h4>
                {recipe.components.map((comp, index) => (
                  <div key={index} className="flex justify-between">
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