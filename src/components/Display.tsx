import { useRef, useEffect } from "react";
import { ParallelAxes } from "desdeo-components";
import {
  DataSet,
  Attribute,
  AttributeSet,
} from "desdeo-components/build/types/dataTypes";

const Display = ({
  title,
  dataSet,
  onClickHandler,
}: {
  title: string;
  dataSet: DataSet[];
  onClickHandler: (attribute_tuple: [number, number]) => void;
}) => {
  const onLineClick = (active: Attribute[]) => {
    console.log(active);
  };

  const onChange = (active: AttributeSet[]) => {
    console.log(active);
  };

  return (
    <div className="display-panel">
      <h4 className="display-header">{title}</h4>
      <div className="plot">
        <ParallelAxes
          data={dataSet}
          onLineClick={onLineClick}
          onChange={onChange}
          onClicking={onClickHandler}
          disableCursor={false}
        />
      </div>
    </div>
  );
};

export default Display;
