import { useState } from "react";

const SingleInput = ({
  points,
  pointIndex,
  setPoints,
}: {
  points: number[];
  pointIndex: number;
  setPoints: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const [currentInput, SetCurrentInput] = useState(points[pointIndex]);
  const [focus, SetFocus] = useState(false);

  return (
    <div className="reference-point-input">
      <label>{`Objective ${pointIndex + 1}`} </label>
      <input
        type="number"
        step="0.000001"
        // defaultValue={points[pointIndex]}
        value={focus ? currentInput : points[pointIndex]}
        onBlur={(e) => {
          points[pointIndex] = currentInput;
          setPoints([...points]);
          // focus out after updating the reference point
          SetFocus(false);
        }}
        onChange={(e) => {
          // focus in to allow live change of input field
          SetFocus(true);
          if (parseFloat(e.target.value)) {
            SetCurrentInput(parseFloat(e.target.value));
          }
        }}
      ></input>
    </div>
  );
};

const ReferencePointInput = ({
  nPoints,
  points,
  setPoints,
}: {
  nPoints: number;
  points: number[];
  setPoints: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  const onSubmit = (event: React.SyntheticEvent): void => {
    event.preventDefault();
  };
  // <SingleInput points={points} pointIndex={0} setPoint={setPoints} />
  return (
    <form onSubmit={onSubmit}>
      {points.map((value, index) => {
        return (
          <SingleInput
            key={index}
            points={points}
            pointIndex={index}
            setPoints={setPoints}
          />
        );
      })}
      <input type="submit" value="Iterate" className="iterate-btn" />
      <input type="submit" value="Save to archive" className="iterate-btn" />
    </form>
  );
};

export default ReferencePointInput;
