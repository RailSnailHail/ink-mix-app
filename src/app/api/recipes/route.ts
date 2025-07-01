import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        isDeleted: false, // Only fetch non-deleted recipes
      },
      include: {
        // Also include the component details for each recipe
        components: {
          include: {
            Ink: true, // And the ink details for each component
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("API Error fetching recipes:", error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}