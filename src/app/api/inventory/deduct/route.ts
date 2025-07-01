import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DeductRequest {
  components: {
    inkId: number;
    grams: number;
  }[];
}

export async function POST(request: Request) {
  try {
    const body: DeductRequest = await request.json();
    const { components } = body;

    if (!components || components.length === 0) {
      return NextResponse.json({ error: 'No components to deduct' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Check all stock levels first.
      for (const component of components) {
        const ink = await tx.ink.findUnique({
          where: { id: component.inkId },
        });
        if (!ink || ink.stockG < component.grams) {
          // If any ink has insufficient stock, throw an error to cancel the transaction.
          throw new Error(`Insufficient stock for ${ink?.name || 'an ink'}. Required: ${component.grams.toFixed(1)}g, Available: ${ink?.stockG.toFixed(1) || 0}g`);
        }
      }

      // Step 2: If all checks pass, proceed with deductions.
      for (const component of components) {
        await tx.ink.update({
          where: { id: component.inkId },
          data: { stockG: { decrement: component.grams } },
        });
      }

      return { success: true };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    // This will catch the "Insufficient stock" error from above.
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error("API Error deducting inventory:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}