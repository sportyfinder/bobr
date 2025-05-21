import {type Img, useSlide} from '../store/slide';

export const ImageToolbar = ({
                                 nodeRect,
                                 img,
                             }: {
    nodeRect: { top: number; left: number };
    img: Img;
}) => {
    const { patch, remove } = useSlide();

    const replaceImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            patch(img.id, { src: URL.createObjectURL(file) });
        };
        input.click();
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: nodeRect.top - 40,
                left: nodeRect.left,
                padding: 4,
                display: 'flex',
                gap: 4,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                zIndex: 30,
            }}
        >
            <button onClick={replaceImage}>↻ Заменить</button>
            <button onClick={() => remove(img.id)}>🗑</button>
        </div>
    );
};