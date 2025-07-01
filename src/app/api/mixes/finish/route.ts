import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

<<<<<<< HEAD
=======
// This GET handler prevents the "Method Not Allowed" crash.
>>>>>>> bfd59ee6 (Final code sync for debugging)
export async function GET() {
  return NextResponse.json(
    { error: "This endpoint is for creating recipes and cannot be fetched." },
    { status: 405 }
  );
}

<<<<<<< HEAD
=======
// This POST handler is now simpler and more robust.
>>>>>>> bfd59ee6 (Final code sync for debugging)
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
<<<<<<< HEAD
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
=======
      // This now ONLY creates a new recipe. It will fail if the name is a duplicate.
      const newRecipe = await tx.recipe.create({
        data: {
>>>>>>> bfd59ee6 (Final code sync for debugging)
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

<<<<<<< HEAD
=======
      // The inventory deduction logic remains the same.
>>>>>>> bfd59ee6 (Final code sync for debugging)
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
<<<<<<< HEAD
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A recipe with this name already exists.' }, { status: 409 });
    }
=======
    // This catch block now correctly handles duplicate recipe names.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A recipe with this name already exists. Please choose a different name.' }, { status: 409 });
    }

>>>>>>> bfd59ee6 (Final code sync for debugging)
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}