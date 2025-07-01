import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // The frontend will send the mix name, its components, and the final color swatch
    const { mixName, components, swatchHex } = body;

    if (!mixName || !components || components.length === 0 || !swatchHex) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalGrams = components.reduce((sum, c) => sum + c.grams, 0);
    if (totalGrams <= 0) {
      return NextResponse.json({ error: 'Mix has no weight' }, { status: 400 });
    }

    // Use a transaction to ensure all database operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a permanent, reusable Recipe
      const newRecipe = await tx.recipe.create({
        data: {
          name: mixName,
          swatchHex: swatchHex,
          components: {
            create: components.map(c => ({
              inkId: c.inkId,
              // Store the ratio for future re-mixing
              ratio: c.grams / totalGrams,
            })),
          },
        },
      });

      // 2. Deduct the used amounts from the main Ink inventory
      for (const component of components) {
        await tx.ink.update({
          where: { id: component.inkId },
          data: { stockG: { decrement: component.grams } },
        });
      }

      return newRecipe;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("API Error finishing mix:", error);
    return NextResponse.json({ error: 'Failed to save and process mix' }, { status: 500 });
  }
}