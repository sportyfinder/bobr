import {useSlide} from "../store/slide.ts";

export const Toolbar = () => {
    const { add, items } = useSlide();

    const addText = () =>
        add({
            type: 'text',
            text: 'Двойной клик для редакт.',
            x: 100,
            y: 60,
            fontSize: 24,
            fontFamily: 'Inter',
            fontStyle: 'normal',
            fill: '#000',
        });

    const addRect = () =>
        add({ type: 'rect', x: 120, y: 120, width: 160, height: 90, fill: '#4f46e5' });

    const addCircle = () =>
        add({ type: 'circle', x: 260, y: 260, radius: 60, fill: '#10b981' });

    const addArrow = () =>
        add({ type: 'arrow', x: 0, y: 0, points: [320, 320, 480, 370], stroke: '#f59e0b', strokeWidth: 4 });

    const addImage = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            add({
                type: 'image',
                src: URL.createObjectURL(file),
                x: 60,
                y: 60,
                width: 220,
                height: 180,
            });
        };
        input.click();
    };

    const exportJSON = () => {
        const url = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items, null, 2))}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = 'slide.json';
        a.click();
    };

    return (
        <aside
            style={{
                position: 'fixed',
                top: 10,
                left: 10,
                display: 'flex',
                gap: '8px',
                zIndex: 10,
            }}
        >
            <button onClick={addText}>Текст</button>
            <button onClick={addImage}>Изображение</button>
            <button onClick={addRect}>Прямоугольник</button>
            <button onClick={addCircle}>Круг</button>
            <button onClick={addArrow}>Стрелка</button>
            <button onClick={exportJSON}>Экспорт JSON</button>
        </aside>
    );
};