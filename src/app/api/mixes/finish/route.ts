import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed. Please use POST to finalize a mix." },
    { status: 405 }
  );
}

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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A recipe with this name already exists.' }, { status: 409 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}