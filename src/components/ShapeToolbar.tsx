import {type Shape, useSlide} from '../store/slide';

export const ShapeToolbar = ({
                                 nodeRect,
                                 item,
                             }: {
    nodeRect: { top: number; left: number };
    item: Shape;
}) => {
    const { remove } = useSlide();

    return (
        <div
            style={{
                position: 'absolute',
                top: nodeRect.top - 40,
                left: nodeRect.left,
                padding: 4,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                zIndex: 30,
            }}
        >
            <button onClick={() => remove(item.id)}>🗑</button>
        </div>
    );
};