import ReferencePointInput from "./ReferencePointInput";

const Control = ({
  title,
  nObjectives,
  ReferencePoint,
  setReferencePoint,
}: {
  title: string;
  nObjectives: number;
  ReferencePoint: number[];
  setReferencePoint: React.Dispatch<React.SetStateAction<number[]>>;
}) => {
  return (
    <div className="control-panel">
      <h4 className="control-header">{title}</h4>
      <div>
        <ReferencePointInput
          nPoints={nObjectives}
          points={ReferencePoint}
          setPoints={setReferencePoint}
        />
      </div>
    </div>
  );
};

export default Control;
