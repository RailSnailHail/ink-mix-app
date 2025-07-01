import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// This new GET function handles unexpected requests gracefully.
export async function GET() {
  // This route is for POST requests only.
  // We return a 405 Method Not Allowed error with a clear JSON message.
  return NextResponse.json(
    { error: "Method Not Allowed. Please use POST to finalize a mix." },
    { status: 405 }
  );
}

// Your existing POST function is correct and remains here.
export async function POST(request: Request) {
  try {
    const { mixName, components, swatchHex } = await request.json();

    if (!mixName || !components || components.length === 0 || !swatchHex) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const totalGrams = components.reduce((sum, c) => sum + c.grams, 0);
    if (totalGrams <= 0) {
      return NextResponse.json({ error: 'Mix has no weight' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create a permanent, reusable Recipe
      const newRecipe = await tx.recipe.upsert({
        where: { name: mixName },
        update: {
            swatchHex: swatchHex,
            components: {
                deleteMany: {},
                create: components.map(c => ({ inkId: c.inkId, ratio: c.grams / totalGrams })),
            }
        },
        create: {
          name: mixName,
          swatchHex: swatchHex,
          components: {
            create: components.map(c => ({ inkId: c.inkId, ratio: c.grams / totalGrams })),
          },
        },
      });

      // Deduct from Ink Inventory
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    console.error("API Error finishing mix:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}