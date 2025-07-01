import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mixName, components, swatchHex } = body;

    // ... (validation for missing fields and totalGrams is the same) ...

    const totalGrams = components.reduce((sum, c) => sum + c.grams, 0);

    const result = await prisma.$transaction(async (tx) => {
      const newRecipe = await tx.recipe.create({
        data: {
          name: mixName,
          swatchHex: swatchHex,
          components: {
            create: components.map(c => ({
              inkId: c.inkId,
              ratio: c.grams / totalGrams,
            })),
          },
        },
      });

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
    // --- THIS IS THE NEW ERROR HANDLING ---
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A recipe with this name already exists.' }, { status: 409 });
    }
    console.error("API Error finishing mix:", error);
    return NextResponse.json({ error: 'Failed to save and process mix' }, { status: 500 });
  }
}