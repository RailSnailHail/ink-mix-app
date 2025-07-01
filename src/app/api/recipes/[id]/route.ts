import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This function SOFT-DELETES a specific recipe
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.recipe.update({
      where: { id },
      data: { isDeleted: true },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
}

// This function RESTORES a specific recipe
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        const restoredRecipe = await prisma.recipe.update({
        where: { id },
        data: { isDeleted: false },
        });
        return NextResponse.json(restoredRecipe);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to restore recipe' }, { status: 500 });
    }
}