import React, { useRef, useState } from "react";
import Moveable from "react-moveable";
import useGet from "./hooks/useGet";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const { loading, response: resImages } = useGet("https://jsonplaceholder.typicode.com/photos");

  const addMoveable = async () => {
    if (loading || !resImages?.length) return;

    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        url: resImages[moveableComponents.length].url
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            handleDelete={(id) => setMoveableComponents(mc => mc.filter(m => m.id !== id))}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  url,
  handleDelete
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      url
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          top,
          left,
          width,
          height,
        }}
        ref={ref}
        onClick={() => setSelected(id)}
      >
        <img
          alt={"img" + id}
          src={url}
          style={{ position: "absolute", height: "100%", width: "100%" }}
        />
        <button
          style={{
            position: "absolute",
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: 'red',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: "pointer"
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(id);
          }}
        >
          x
        </button>
      </div>
      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={({ top, left }) => {
          const { width: parentWidth, height: parentHeight } = parentBounds;
          const isOutOfBounds = (top < 0 || top > parentHeight - height) || (left < 0 || left > parentWidth - width);

          if (isOutOfBounds) {
            return;
          }

          updateMoveable(id, {
            top,
            left,
            width,
            height,
            color,
            url
          });
        }}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
