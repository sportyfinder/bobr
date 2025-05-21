import { useEffect, useState } from 'react';
import {type Txt, useSlide} from "../store/slide.ts";

export const TextToolbar = ({ nodeRect, text }: {
    nodeRect: { top: number; left: number };
    text: Txt;
}) => {
    const { patch, remove } = useSlide();
    const [loc, setLoc] = useState(nodeRect);

    useEffect(() => setLoc(nodeRect), [nodeRect]);

    const toggle = (flag: 'bold' | 'italic') => {
        const cur = text.fontStyle.split(' ');
        const next = cur.includes(flag)
            ? cur.filter((f) => f !== flag)
            : [...cur, flag];
        patch(text.id, { fontStyle: next.join(' ') as Txt['fontStyle'] });
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: loc.top - 40,
                left: loc.left,
                padding: 4,
                display: 'flex',
                gap: 4,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                zIndex: 30,
            }}
        >
            <input
                type="color"
                value={text.fill}
                onChange={(e) => patch(text.id, { fill: e.target.value })}
            />
            <input
                type="number"
                min={8}
                max={200}
                value={text.fontSize}
                onChange={(e) => patch(text.id, { fontSize: +e.target.value })}
                style={{ width: 60 }}
            />
            <select
                value={text.fontFamily}
                onChange={(e) => patch(text.id, { fontFamily: e.target.value })}
            >
                {['Inter', 'Arial', 'Times New Roman', 'Roboto', 'Montserrat']
                    .map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
            </select>
            <button onClick={() => toggle('bold')} style={{ fontWeight: 'bold' }}>
                B
            </button>
            <button onClick={() => toggle('italic')} style={{ fontStyle: 'italic' }}>
                I
            </button>
            <button onClick={() => remove(text.id)}>🗑</button>
        </div>
    );
};