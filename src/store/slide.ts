import { create } from 'zustand';
import { nanoid } from 'nanoid';

type Base = { id: string; x: number; y: number };

export type Txt = Base & {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontStyle: 'normal' | 'bold' | 'italic' | 'bold italic';
    fill: string;
    width?: number;
    height?: number;
};

export type Img = Base & {
    type: 'image';
    src: string;
    width: number;
    height: number;
};

export type Rect = Base & {
    type: 'rect';
    width: number;
    height: number;
    fill: string;
};

export type Circle = Base & {
    type: 'circle';
    radius: number;
    fill: string;
};

export type Arrow = Base & {
    type: 'arrow';
    points: number[];
    stroke: string;
    strokeWidth: number;
};

export type Shape = Txt | Img | Rect | Circle | Arrow;

type ShapeWithoutId = Omit<Shape, 'id'>;

interface SlideState {
    items: Shape[];
    selected: string | null;
    add: <S extends ShapeWithoutId>(s: S) => void;
    patch: <S extends Shape>(id: string, p: Partial<S>) => void;
    remove: (id: string) => void;
    select: (id: string | null) => void;
}

export const useSlide = create<SlideState>((set) => ({
    items: [],
    selected: null,

    add: (s) =>
        set((st) => ({
            items: [...st.items, { ...s, id: nanoid() }] as Shape[],
        })),

    patch: (id, p) =>
        set((st) => ({
            items: st.items.map((it) =>
                it.id === id ? ({ ...it, ...p } as Shape) : it,
            ),
        })),

    remove: (id) =>
        set((st) => ({
            items: st.items.filter((it) => it.id !== id),
            selected: st.selected === id ? null : st.selected,
        })),

    select: (id) => set({ selected: id }),
}));