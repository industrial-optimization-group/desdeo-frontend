import { useRef, useEffect } from "react";
import { ParallelAxes, DataTable } from "desdeo-components";
import { useState } from "react";
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

  const [dataSet2, setDataSet2] = useState([
    {
      label: "WQ Fishery",
      data: [
        { id: "wq-fishery-0", isSelected: false, value: 6.042483 },
        { id: "wq-fishery-1", isSelected: false, value: 5.758127 },
        { id: "wq-fishery-2", isSelected: false, value: 6.287081 },
      ],
    },

    {
      label: "WQ City",
      data: [
        { id: "wq-city-0", isSelected: false, value: 3.17527 },
        { id: "wq-city-1", isSelected: false, value: 3.410843 },
        { id: "wq-city-2", isSelected: false, value: 3.207926 },
      ],
    },

    {
      label: "ROI",
      data: [
        { id: "roi-0", isSelected: false, value: 6.090291 },
        { id: "roi-1", isSelected: false, value: 6.887735 },
        { id: "roi-2", isSelected: false, value: 2.992514 },
      ],
    },

    {
      label: "City Tax",
      data: [
        { id: "city-tax-0", isSelected: false, value: 2.444406 },
        { id: "city-tax-1", isSelected: false, value: 8.989781 },
        { id: "city-tax-2", isSelected: false, value: 2.758216 },
      ],
    },

    {
      label: "Plant Resources",
      data: [
        { id: "plant-resources-0", isSelected: false, value: 0.248895 },
        { id: "plant-resources-1", isSelected: false, value: 0.346752 },
        { id: "plant-resources-2", isSelected: false, value: 0.326688 },
      ],
    },
  ]);

  return (
    <div className="display-panel">
      <h4 className="display-header">{title}</h4>
      <div className="plot">
        <ParallelAxes
          data={dataSet2}
          onLineClick={onLineClick}
          onChange={onChange}
          onClicking={onClickHandler}
          disableCursor={false}
        />
      </div>
      <div className="plot">
        <ParallelAxes
          data={dataSet}
          onLineClick={onLineClick}
          onChange={onChange}
          onClicking={onClickHandler}
          disableCursor={false}
        />
      </div>
      <div>
        <DataTable onClick={() => {}} data={dataSet} />
      </div>
    </div>
  );
};

export default Display;
