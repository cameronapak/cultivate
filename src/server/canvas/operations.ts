import { HttpError } from 'wasp/server';
import type { SaveCanvas, LoadCanvas } from 'wasp/server/operations';

export const saveCanvas: SaveCanvas<{ snapshot: any, id: number }, { success: boolean }> = async (args, context) => {
  try {
    // Upsert the canvas with ID 1
    await context.entities.Canvas.upsert({
      where: { id: args.id },
      update: { snapshot: JSON.stringify(args.snapshot) },
      create: { 
        id: args.id,
        snapshot: JSON.stringify(args.snapshot)
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save canvas:', error);
    throw new HttpError(500, 'Failed to save canvas');
  }
};

export const loadCanvas: LoadCanvas<{ id: number }, any> = async (args, context) => {
  try {
    const canvas = await context.entities.Canvas.findUnique({
      where: { id: args.id }
    });

    return canvas ? JSON.parse(canvas.snapshot) : null;
  } catch (error) {
    console.error('Failed to load canvas:', error);
    throw new HttpError(500, 'Failed to load canvas');
  }
}; 