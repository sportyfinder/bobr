import {
    Stage,
    Layer,
    Rect,
    Circle,
    Arrow,
    Image as KonvaImage,
    Text,
    Transformer,
} from 'react-konva';
import { Stage as KonvaStage } from 'konva/lib/Stage';
import { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';
import { Node as KonvaNode, type KonvaEventObject } from 'konva/lib/Node';
import useImage from 'use-image';
import { useEffect, useRef, useState } from 'react';
import {type Img, type Shape, type Txt, useSlide} from "../store/slide.ts";
import {TextToolbar} from "./TextToolbar.tsx";
import {ShapeToolbar} from "./ShapeToolbar.tsx";
import {ImageToolbar} from "./ ImageToolbar.tsx";

const ImageShape = ({ it }: { it: Img }) => {
    const [img] = useImage(it.src);
    const { patch, select } = useSlide();

    const onDragEnd = (e: KonvaEventObject<DragEvent>) =>
        patch(it.id, { x: e.target.x(), y: e.target.y() });

    return (
        <KonvaImage
            id={it.id}
            image={img}
            x={it.x}
            y={it.y}
            width={it.width}
            height={it.height}
            draggable
            onDragEnd={onDragEnd}
            onClick={() => select(it.id)}
            onTap={() => select(it.id)}
        />
    );
};

const KonvaItem = ({ it }: { it: Shape }) => {
    const { patch, select } = useSlide();

    const common = {
        id: it.id,
        x: it.x,
        y: it.y,
        draggable: true,
        onDragEnd: (e: KonvaEventObject<DragEvent>) =>
            patch(it.id, { x: e.target.x(), y: e.target.y() }),
        onClick: () => select(it.id),
        onTap: () => select(it.id),
    };

    switch (it.type) {
        case 'text':
            return (
                <Text
                    {...common}
                    text={it.text}
                    fontSize={it.fontSize}
                    fontStyle={it.fontStyle}
                    fontFamily={it.fontFamily}
                    fill={it.fill}
                />
            );
        case 'rect':
            return <Rect {...common} width={it.width} height={it.height} fill={it.fill} />;
        case 'circle':
            return <Circle {...common} radius={it.radius} fill={it.fill} />;
        case 'arrow':
            return (
                <Arrow
                    {...common}
                    points={it.points}
                    stroke={it.stroke}
                    strokeWidth={it.strokeWidth}
                />
            );
        case 'image':
            return <ImageShape it={it} />;
    }
};

export const SlideCanvas = () => {

    const [toolbarPos, setToolbarPos] =
        useState<{ top: number; left: number } | null>(null);
    const { items, selected, patch, select } = useSlide();
    const stageRef = useRef<KonvaStage | null>(null);
    const trRef = useRef<KonvaTransformer | null>(null);

    const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
        const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selected) useSlide.getState().remove(selected);
            if (e.key === 'Escape') select(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selected, select]);

    useEffect(() => {
        if (!trRef.current || !stageRef.current) return;
        const node = stageRef.current.findOne<KonvaNode>(`#${selected}`);
        trRef.current.nodes(node ? [node] : []);
        trRef.current.getLayer()?.batchDraw();
    }, [selected, items]);

    useEffect(() => {
        if (!stageRef.current) return;
        const node = selected
            ? stageRef.current.findOne<KonvaNode>(`#${selected}`)
            : null;

        if (node) {
            const { x, y } = node.getClientRect();
            const { top, left } = stageRef.current.container().getBoundingClientRect();
            setToolbarPos({ top: top + y, left: left + x });
        } else {
            setToolbarPos(null);
        }
    }, [selected, dims]);

    const handleDblClick = (it: Txt, pointer: { x: number; y: number }) => {
        const textarea = document.createElement('textarea');
        textarea.value = it.text;
        Object.assign(textarea.style, {
            position: 'absolute',
            top: `${pointer.y}px`,
            left: `${pointer.x}px`,
            fontSize: `${it.fontSize}px`,
            fontFamily: it.fontFamily,
            border: '1px solid #ccc',
            padding: '2px',
        });
        textarea.onblur = () => {
            patch(it.id, { text: textarea.value });
            document.body.removeChild(textarea);
        };
        document.body.appendChild(textarea);
        textarea.focus();
    };

    return (
        <>
            <Stage
                width={dims.w}
                height={dims.h}
                ref={stageRef}
                onDblClick={(e) => {
                    const id = (e.target as KonvaNode).id();
                    const shape = items.find((s) => s.id === id);
                    if (shape?.type === 'text')
                        handleDblClick(shape, stageRef.current!.getPointerPosition()!);
                }}
            >
                <Layer>
                    {items.map((it) => (
                        <KonvaItem key={it.id} it={it} />
                    ))}

                    <Transformer
                        ref={trRef}
                        boundBoxFunc={(oldBox, newBox) =>
                            newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
                        }
                        onTransformEnd={() => {
                            const node = trRef.current?.nodes()?.[0];
                            if (!node || !selected) return;

                            const x  = node.x();
                            const y  = node.y();
                            const sx = node.scaleX();
                            const sy = node.scaleY();

                            const current = items.find((i) => i.id === selected);
                            if (!current) return;

                            switch (current.type) {
                                case 'rect':
                                case 'image':
                                    patch(selected, {
                                        x,
                                        y,
                                        width:  node.width()  * sx,
                                        height: node.height() * sy,
                                    });
                                    break;

                                case 'circle':
                                    patch(selected, {
                                        x,
                                        y,
                                        radius: (node.width() * sx) / 2,
                                    });
                                    break;

                                case 'arrow': {
                                    const raw = (node as unknown as { points(): number[] }).points();
                                    const scaled = raw.map((v, idx) => (idx % 2 === 0 ? v * sx : v * sy));

                                    patch(selected, { x, y, points: scaled });
                                    break;
                                }
                            }

                            node.scaleX(1);
                            node.scaleY(1);
                        }}
                    />
                </Layer>
            </Stage>
            {toolbarPos && selected && (() => {
                const item = items.find((i) => i.id === selected)!;
                return <ShapeToolbar nodeRect={toolbarPos} item={item} />;
            })()}

            {toolbarPos && selected && (() => {
                const txt = items.find((i) => i.id === selected);
                return txt?.type === 'text' ? (
                    <TextToolbar nodeRect={toolbarPos} text={txt} />
                ) : null;
            })()}

            {toolbarPos && selected && (() => {
                const img = items.find((i) => i.id === selected);
                return img?.type === 'image' ? (
                    <ImageToolbar nodeRect={toolbarPos} img={img}/>
                ) : null;
            })()}
        </>
    );
};