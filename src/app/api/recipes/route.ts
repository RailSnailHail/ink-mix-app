import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const showDeleted = request.nextUrl.searchParams.get('deleted') === 'true';
    const recipes = await prisma.recipe.findMany({
      where: { isDeleted: showDeleted },
      include: {
        components: {
          include: {
            Ink: {
              select: { id: true, name: true, shade: true, colorHex: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}