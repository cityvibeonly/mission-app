import { useEffect, useRef, useState } from "react";
import React from "react";
import axios from "axios";
import {Draw, Interaction, Modify} from "ol/interaction.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import Select from "ol/interaction/Select.js";
import { Circle as CircleStyle, Fill, Stroke, Style, RegularShape, Text } from "ol/style.js";
import { LineString, Point } from "ol/geom";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer, Group as LayerGroup } from "ol/layer.js";
import { getArea, getLength } from "ol/sphere.js";
import GeoJSON from "ol/format/GeoJSON.js";
import TileWMS from "ol/source/TileWMS.js";
import { getUid } from "ol/util";
import { bbox } from "ol/loadingstrategy.js";
import { SketchPicker } from "react-color";
import reactCSS from "reactcss";
import { altKeyOnly, click, pointerMove } from "ol/events/condition.js";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Draggable from "react-draggable";
import { Box, Slider, Paper } from "@mui/material";

// import ImageWMS from "ol/source/ImageWMS.js";
// import ImageLayer from "ol/layer/Image.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import Projection from "ol/proj/Projection.js";
import { AlignHorizontalLeftSharp } from "@mui/icons-material";
import { clear } from "@testing-library/user-event/dist/clear";
import { renderToString } from "react-dom/server";

proj4.defs([
  ["EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"],
  [
    "EPSG:3857",
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs",
  ],
  [
    "EPSG:5173",
    "+proj=tmerc +lat_0=38 +lon_0=125.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5174",
    "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5175",
    "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=550000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5176",
    "+proj=tmerc +lat_0=38 +lon_0=129.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5177",
    "+proj=tmerc +lat_0=38 +lon_0=131.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5178",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=bessel +units=m +no_defs",
  ],
  [
    "EPSG:5179",
    "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5180",
    "+proj=tmerc +lat_0=38 +lon_0=125 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5181",
    "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5182",
    "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=550000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5183",
    "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5184",
    "+proj=tmerc +lat_0=38 +lon_0=131 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5185",
    "+proj=tmerc +lat_0=38 +lon_0=125 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5186",
    "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5187",
    "+proj=tmerc +lat_0=38 +lon_0=129 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:5188",
    "+proj=tmerc +lat_0=38 +lon_0=131 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  ],
  [
    "EPSG:32651",
    "+proj=utm +zone=51 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
  ],
  [
    "EPSG:32652",
    "+proj=utm +zone=52 +ellps=WGS84 +datum=WGS84 +units=m +no_defs",
  ],
]);

register(proj4);

export default function MainMap() {
  const mapStyle = {
    width: 1300,
    height: 550,
  };

  const projection = new Projection({
    code: "EPSG:3857",
  });

  const [map, setMap] = useState("");
  const [measurementType, setMeasurementType] = useState(""); // 'length' or 'area'
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layerType, setLayerType] = useState(""); // 'tile' or 'vector'
  const [drawInteraction, setDrawInteraction] = useState("");
  const [drawVectorLayer ,setDrawVectorLayer] = useState('')
  const [measurementOverlay, setMeasurementOverlay] = useState("");
  const [measuring, setMeasuring] = useState(false)
  const [segmentChecked, setSegmentChecked] = useState(true);
  const [clearPreviousChecked, setClearPreviousChecked] = useState(true);
  const [tileWmsSource, _setTileWmsSource] = useState("");
  const tileWmsSourceRef = useRef(tileWmsSource);
  const setTileWmsSource = (tileWmsSource) => {
    tileWmsSourceRef.current = tileWmsSource;
    _setTileWmsSource(tileWmsSource);
  };
  const [wmsFeatInfoJson, _setWmsFeatInfoJson] = useState("");
  const wmsFeatInfoJsonRef = useRef(wmsFeatInfoJson);
  const setWmsFeatInfoJson = (wmsFeatProps) => {
    wmsFeatInfoJsonRef.current = wmsFeatProps;
    _setWmsFeatInfoJson(wmsFeatProps);
  };
  const [wmsClicked, setWmsClicked] = useState(false);
  const [addedLayer, setAddedLayer] = useState("");
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [displayFeatureColorPicker, setDisplayFeatureColorPicker] =
    useState(false);
  const [featureColorStyle, setFeatureColorStyle] = useState({
    color: {
      r: "241",
      g: "112",
      b: "19",
      a: "1",
    },
  });
  const [dialogSize, setDialogSize] = useState({
    width: 400,
    height: 400,
  });
  const [featureInfo, setFeatureInfo] = useState(null);
  const [displayStyleButton, setDisplayStyleButton] = useState(false);
  const [layerStyleDialogOpen, setLayerStyleDialogOpen] = useState(false);
  // fill color
  const [displayFillPicker, setDisplayFillPicker] = useState(false);
  const [fillColorStyle, setFillColorStyle] = useState({
    // 값 바뀌는 구조 그대로 초기값 셋팅해주기
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  const [vectorFillColor, setVectorFillColor] = useState({
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  // stroke color
  const [displayStrokePicker, setDisplayStrokePicker] = useState(false);
  const [strokeColorStyle, setStrokeColorStyle] = useState({
    // 값 바뀌는 구조 그대로 초기값 셋팅해주기
    color: {
      r: "0",
      g: "0",
      b: "0",
      a: "1",
    },
  });
  const [vectorStrokeColor, setVectorStrokeColor] = useState({
    color: {
      r: "0",
      g: "0",
      b: "0",
      a: "1",
    },
  });
  // stroke width
  const [strokeWidth, setStrokeWidth] = useState(2);
  // point color
  const [displayPointPicker, setDisplayPointPicker] = useState(false);
  const [vectorPointFillColor, setVectorPointFillColor] = useState({
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  const [pointFillColorStyle, setPointFillColorStyle] = useState({
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  const [vectorPointStrokeColor, setVectorPointStrokeColor] = useState({
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  const [displayPointStrokePicker, setDisplayPointStrokePicker] =
    useState(false);
  const [pointStrokeColorStyle, setPointStrokeColorStyle] = useState({
    color: {
      r: "255",
      g: "205",
      b: "92",
      a: "77",
    },
  });
  const [pointStrokeWidth, setPointStrokeWidth] = useState(2);

  // point radius
  const [pointRadius, setPointRadius] = useState(7);
  const [filter, _setFilter] = useState("");
  const filterRef = useRef(filter);
  const setFilter = (value) => {
    filterRef.current = value;
    _setFilter(value);
  };
  const [filterButton, setFilterButton] = useState(false);
  const [filterYear, setFilterYear] = useState("");

  const view = new View({
    center: [14134735.270495, 4518651.364106],
    zoom: 11,
    minZoom: 5.5,
    maxZoom: 20,
  });

  // 맵 생성
  useEffect(() => {
    let raster;
    if (!map) {
      raster = new TileLayer({
        source: new OSM(),
      });
      

      const newMap = new Map({
        layers: [raster],
        target: "map",
        view: view,
      });

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.dispose();
      }
    };
  }, [map]);

  // // 오버레이 띄우기
  // useEffect(() => {
  //   if (map && measurementType && !measurementOverlay) {
  //     const overlay = new Overlay({
  //       offset: [10, 0],
  //       positioning: "bottom-left",
  //     });
  //     setMeasurementOverlay(overlay);
  //     map.addOverlay(overlay);
  //   }
  // }, [map, measurementType, measurementOverlay]);



  const showSegment = document.getElementById('segments');
  const clearPrevious = document.getElementById('clear');


  const style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.5)',
      lineDash: [10, 10],
      width: 2,
    }),
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
    }),
  });

  const labelStyle = new Style({
    text: new Text({
      font: '14px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: -15,
    }),
    image: new RegularShape({
      radius: 8,
      points: 3,
      angle: Math.PI,
      displacement: [0, 10],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
    }),
  });

  const tipStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  const modifyStyle = new Style({
    image: new CircleStyle({
      radius: 5,
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
    text: new Text({
      text: '그래그해서 수정!',
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(0, 0, 0, 0.7)',
      }),
      padding: [2, 2, 2, 2],
      textAlign: 'left',
      offsetX: 15,
    }),
  });

  const segmentStyle = new Style({
    text: new Text({
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: 'rgba(255, 255, 255, 1)',
      }),
      backgroundFill: new Fill({
        color: 'rgba(100, 0, 0, 0.4)',
      }),
      padding: [2, 2, 2, 2],
      textBaseline: 'bottom',
      offsetY: -12,
    }),
    image: new RegularShape({
      radius: 6,
      points: 3,
      angle: Math.PI,
      displacement: [0, 8],
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.4)',
      }),
    }),
  });

  const segmentStyles = [segmentStyle];

  const formatLength = function (line) {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
      output = Math.round(length * 100) / 100 + ' m';
    }
    return output;
  };

  const formatArea = function (polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
    } else {
      output = Math.round(area * 100) / 100 + ' m\xB2';
    }
    return output;
  };

  const drawVectorSource = new VectorSource()

  const modify = new Modify({source: drawVectorSource, style: modifyStyle});

  let tipPoint;

  function styleFunction(feature, segments, drawType, tip) {
    const styles = [];
    const geometry = feature.getGeometry();
    const type = geometry.getType();
    let point, label, line;
    if (!drawType || drawType === type || type === 'Point') {
      styles.push(style);
      if (type === 'Polygon') {
        point = geometry.getInteriorPoint();
        label = formatArea(geometry);
        line = new LineString(geometry.getCoordinates()[0]);
      } else if (type === 'LineString') {
        point = new Point(geometry.getLastCoordinate());
        label = formatLength(geometry);
        line = geometry;
      }
    }
    if (segments && line) {
      let count = 0;
      line.forEachSegment(function (a, b) {
        const segment = new LineString([a, b]);
        const label = formatLength(segment);
        if (segmentStyles.length - 1 < count) {
          segmentStyles.push(segmentStyle.clone());
        }
        const segmentPoint = new Point(segment.getCoordinateAt(0.5));
        segmentStyles[count].setGeometry(segmentPoint);
        segmentStyles[count].getText().setText(label);
        styles.push(segmentStyles[count]);
        count++;
      });
    }
    if (label) {
      labelStyle.setGeometry(point);
      labelStyle.getText().setText(label);
      styles.push(labelStyle);
    }
    if (
      tip &&
      type === 'Point' &&
      !modify.getOverlay().getSource().getFeatures().length
    ) {
      tipPoint = geometry;
      tipStyle.getText().setText(tip);
      styles.push(tipStyle);
    }
    return styles;
  }
  

  const newDrawVectorLayer = new VectorLayer({
    source: drawVectorSource,
    title: "drawVector",
    style: function (feature) {
      return styleFunction(feature, showSegment.checked)
    }
  });

  let draw;

  function addInteraction() {
    const drawType = measurementType === 'area'? 'Polygon' : 'LineString'
    const activeTip =(drawType === 'Polygon' ? 'polygon' : 'line') +
      '을 더 그리려면 클릭!';
    const idleTip = '클릭해서 측정 시작!';
    let tip = idleTip;
    draw = new Draw({
      source: drawVectorSource,
      type: drawType,
      style: function (feature) {
        return styleFunction(feature, showSegment.checked, drawType, tip);
      },
    });
    draw.on('drawstart', function () {
      if (clearPrevious.checked) {
        drawVectorSource.clear();
      }
      modify.setActive(false);
      tip = activeTip;
    });
    draw.on('drawend', function () {
      modifyStyle.setGeometry(tipPoint);
      modify.setActive(true);
      map.once('pointermove', function () {
        modifyStyle.setGeometry();
      });
      tip = idleTip;
      setMeasuring(false);
    });
    modify.setActive(true);
    map.addInteraction(draw);

    showSegment.onChange = function () {
      drawVectorSource.changed();
      draw.getOverlay().changed();

    };
    
  }

  // 측정 인터랙션 추가
  useEffect(() => {

    if(measuring === true) {
      if (map && measurementType) {
        map.getInteractions().getArray().map((item) => {
          if(item instanceof Draw){
          map.removeInteraction(item)
          }
          })
          map.getLayers().getArray().map((item) => {
            if(item.get("title") === "drawVector"){
              map.removeLayer(item)
            }
            })
      }

      addInteraction();
      map.addLayer(newDrawVectorLayer);
      map.addInteraction(modify);
  }

}, [map, measurementType]);

useEffect(() => {

}, [segmentChecked])


// segment 체크박스 핸들러
  const handleSegment = () => {
    if(segmentChecked === true) {
      setSegmentChecked(false)
    } else if(segmentChecked === false) {
      setSegmentChecked(true)
    }
  }

  // 이전 측정 도형 clear 핸들러
  const handleClearPrevious = () => {
    if(clearPreviousChecked === true) {
      setClearPreviousChecked(false)
    } else if(clearPreviousChecked === false) {
      setClearPreviousChecked(true)
    }
  }

  // draw된 레이어 전체 지우기
  const handleRemoveDrawVectorLayer = () => {
    map.removeOverlay(measurementOverlay)

    const drawVector = map.getLayers().getArray().filter(item => item.get("title") === "drawVector");
    
    if(drawVector.length > 0) {
      drawVector.forEach((layer) => layer.getSource().clear())
    }
    // map.getLayers().getArray()
    // .filter(layer => layer === drawVectorLayer)
    // .forEach(layer => map.removeLayer(layer))
  }

  // 측정 관련 메서드
  const handleMeasurementTypeSelect = (type) => {
    // if(addedLayer) {
    //   setLayerType("")
    //   setAddedLayer('');
    // }
    setMeasurementType(type);
    setMeasuring(true)
    map.removeInteraction(draw);
    addInteraction();
  };

  const handleLayerSelectChange = (e) => {
    setSelectedLayer(e.target.value);
    setLayerType(null);
    
  };

  const createMeasurementElement = (output) => {
    const element = document.createElement("div");
    element.className = "measurement-tooltip";
    element.innerHTML = output;
    return element;
  };

  // 버튼 누르면 매개변수 타입에 따라 다른 레이어가 지도 위에 표출
  const handleLayerTypeChange = (type) => {
    setLayerType((prev) => {
      if (prev !== type) {
        // 조건: 현재의 값이 새로 받아온 type과 다를 경우
        onChangeLayerStyle(type); // 지도에 레이어 띄우는 함수를 실행
        return type; // 받아온 type으로 layerType state 업데이트
      }
    });
  };

  // 타일 생성
  const createTileLayer = (layerName, filter) => {
    console.log("tile");
    const extent = [
      14062120.093624081, 4488076.55279193, 14207350.447365917,
      4549226.175420071,
    ];

    const wmsSource = new TileWMS({
      url: "http://127.0.0.1:8080/geoserver/foss/wms",
      params: { LAYERS: `foss:${layerName}`, TILED: true, CQL_FILTER: filter },
    });

    setTileWmsSource(wmsSource);

    return new TileLayer({
      extent: extent,
      source: wmsSource,
      serverType: "geoserver",
      crossOrigin: "anonymous",
      title: layerName,
    });
    // return new TileLayer({
    //   extent: extent,
    //   source: new TileWMS({
    //     url: `http://127.0.0.1:8080/geoserver/foss/wms`,
    //     params: { 'LAYERS': `foss:${layerName}`, 'TILED' : true },
    //     ratio: 1,
    //     serverType: "geoserver",
    //   }),
    // });
  };

  // 벡터 레이어 스타일 편집
  const handleLayerStyleDialogOpen = () => {

      setLayerStyleDialogOpen(true);
    

    

    console.log(
      addedLayer.getSource().getFeatures()[0].getGeometry().getType()
    ); // .getType()
    console.log(addedLayer.getSource().getFeatures().length)
  };

  const handleLayerDialogClose = () => {
    setLayerStyleDialogOpen(false);
  };

  // fill color
  const fillColorBarStyles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${vectorFillColor.color.r}, ${vectorFillColor.color.g}, ${vectorFillColor.color.b}, ${vectorFillColor.color.a})`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  const handleFillPickerOpen = () => {
    setDisplayFillPicker(true);
  };

  const handleFillColorPickerClose = () => {
    setDisplayFillPicker(false);
  };

  const handleFillColorChange = (color) => {
    const selectColor = { color: color.rgb };
    setFillColorStyle(selectColor);
    setVectorFillColor(selectColor);

    //  new Style({
    //   fill: new Fill({
    //     color: vectorFillColor,
    //   }),
    //   stroke: new Stroke({
    //     color: defaultLayerStrokeColor,
    //     width: 2,
    //   }),
    //   // image: new CircleStyle({
    //   //   fill: new Fill({
    //   //     color: "#123456"
    //   //   })
    //   // })
    // });
  };

  // Stroke color
  const strokeColorBarStyles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${vectorStrokeColor.color.r}, ${vectorStrokeColor.color.g}, ${vectorStrokeColor.color.b}, ${vectorStrokeColor.color.a})`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  const handleStrokePickerOpen = () => {
    setDisplayStrokePicker(true);
  };

  const handleStrokePickerClose = () => {
    setDisplayStrokePicker(false);
  };

  const handleStrokeColorChange = (color) => {
    const selectColor = { color: color.rgb };
    setStrokeColorStyle(selectColor);
    setVectorStrokeColor(selectColor);
  };

  // Stroke Width
  // slider
  const strokeWidthSliderValue = (value) => {
    setStrokeWidth(value);
    return value;
  };

  // point color
  const pointFillColorBarStyles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${vectorPointFillColor.color.r}, ${vectorPointFillColor.color.g}, ${vectorPointFillColor.color.b}, ${vectorPointFillColor.color.a})`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  const handlePointPickerOpen = () => {
    setDisplayPointPicker(true);
  };

  const handlePointPickerClose = () => {
    setDisplayPointPicker(false);
  };

  const handlePointColorChange = (color) => {
    const selectColor = { color: color.rgb };
    setPointFillColorStyle(selectColor);
    setVectorPointFillColor(selectColor);
  };

  const pointStrokeColorBarStyles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${vectorPointStrokeColor.color.r}, ${vectorPointStrokeColor.color.g}, ${vectorPointStrokeColor.color.b}, ${vectorPointStrokeColor.color.a})`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  const handlePointStrokePickerOpen = () => {
    setDisplayPointStrokePicker(true);
  };

  const handlePointStrokePickerClose = () => {
    setDisplayPointStrokePicker(false);
  };

  const handlePointStrokeColorChange = (color) => {
    const selectColor = { color: color.rgb };
    setPointStrokeColorStyle(selectColor);
    setVectorPointStrokeColor(selectColor);
  };

  // slider
  const pointStrokeWidthSliderValue = (value) => {
    setPointStrokeWidth(value);
    return value;
  };

  // point radius
  // slider
  const pointRadiusSliderValue = (value) => {
    setPointRadius(value);
    return value;
  };

  // save button
  const handleLayerDialogSave = () => {
    onChangeLayerStyle(layerType); // 레이어 스타일 편집 다이얼로그 저장 버튼을 눌렀을 시, 변경된 내용으로 레이어 표출
    setLayerStyleDialogOpen(false);
  };

  // 벡터 레이어 style function
  const vectorLayerStyle = function (feature) {
    const selectedLayerStyle = new Style({
      fill: new Fill({
        color: `rgba(${vectorFillColor.color.r}, ${vectorFillColor.color.g}, ${vectorFillColor.color.b}, ${vectorFillColor.color.a})`,
      }),
      stroke: new Stroke({
        color: `rgba(${vectorStrokeColor.color.r}, ${vectorStrokeColor.color.g}, ${vectorStrokeColor.color.b}, ${vectorStrokeColor.color.a})`,
        width: strokeWidth,
      }),
      image: new CircleStyle({
        radius: pointRadius,
        fill: new Fill({
          color: `rgba(${vectorPointFillColor.color.r}, ${vectorPointFillColor.color.g}, ${vectorPointFillColor.color.b}, ${vectorPointFillColor.color.a})`,
        }),
        stroke: new Stroke({
          color: `rgba(${vectorPointStrokeColor.color.r}, ${vectorPointStrokeColor.color.g}, ${vectorPointStrokeColor.color.b}, ${vectorPointStrokeColor.color.a})`,
          width: pointStrokeWidth,
        }),
      }),
    });
    return selectedLayerStyle;
  };

  // 벡터 레이어 생성

  /**
   * @function createVectorLayer
   * @description 벡터레이어 생성
   * @author 김채은
   * @param { String } layerName 레이어 이름
   * @returns
   */
  const createVectorLayer = (layerName) => {
    /**
     * @copyright Mango System
     */
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      loader: function (extent, resolution, projection) {
        const proj = projection.getCode();
        const url =
          "http://localhost:8080/geoserver/foss/ows?service=WFS&version=1.0.0&request=GetFeature&typename=foss:" +
          layerName +
          "&outputFormat=application/json&srsname=" +
          proj +
          "&maxCount=30000&bbox=" +
          extent.join(",") +
          "," +
          proj;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
          if (xhr.status == 200) {
            const features = vectorSource
              .getFormat()
              .readFeatures(xhr.responseText);
            vectorSource.addFeatures(features);
          }
        };
        xhr.send();
      },
      strategy: bbox,
    });

    return new VectorLayer({
      title: layerName,
      source: vectorSource,
      style: vectorLayerStyle,
    });
  };

  // 맵에 레이어 추가
  const onChangeLayerStyle = (layerType, filter) => {
    if (map && selectedLayer) {
      // 이미 추가된 레이어 있는 경우 모든 레이어 제거
      if (addedLayer) {
        //map.removeLayer(addedLayer);
        setFilterButton(false);
        setDisplayStyleButton(false);
        setWmsClicked(false);
        setWmsFeatInfoJson('');
        setFeatureInfo(null);

        map.getLayers().getArray()
          .filter(layer => layer.get('title') !== undefined)
          .forEach(layer => map.removeLayer(layer)) // title을 검출하고 있는경우 db연결된 레이어일 경우. 
      }

      console.log("selectedLayer: ", selectedLayer);

      let layer;
      if (layerType === "tile") {
        layer = createTileLayer(selectedLayer, filter);
        setFilterButton(true); // selectedLayer.includes("admin") === true
      } else if (layerType === "vector") {
        layer = createVectorLayer(selectedLayer);
        // 해당레이어의 스타일을 변경하는 버튼 표출
        setDisplayStyleButton(true);
      }

      // 만들어진 레이어를 addLayer로 세팅
      setAddedLayer(layer);

      // 새로운 레이어 추가
      map.addLayer(layer);

      // console.log(layer.getFeatures())

      // map.on('pointermove', function (evt) {
      //   if (evt.dragging) {
      //     return;
      //   }
      //   const data = layer.getData(evt.pixel);

      // })

      selectElement.onchange = changeInteraction; 
      changeInteraction();

    }
  };



  useEffect(()=>{
    if (addedLayer instanceof TileLayer) {

      let settingWmsData = function (evt) {
        // let wmsFeatInfo = document.getElementById('#info').innerHTML
        // wmsFeatInfo = '';
        // console.group('clickEvt');
        // console.info(layer);
        // console.groupEnd('clickEvt');
        setWmsFeatInfoJson('')
        setWmsClicked(true);
        // console.log(layer);
        const viewResolution = /** @type {number} */ (view.getResolution());
    
        console.log(tileWmsSourceRef.current);
    
        // setTileWmsSource(tileWmsSourceRef.current)
        console.log(projection.getCode());
    
        const proj = projection.getCode();
        var url = addedLayer
          .getSource()
          .getFeatureInfoUrl(evt.coordinate, viewResolution, proj, {
            INFO_FORMAT: "application/json",
          });
          
          
        if (url) {
          axios.get(url).then((response) => {
    
            if(response.data.features[0] === undefined) {
              console.log('피처 없는 영역')
              setWmsFeatInfoJson('')
            } 
            else {
              setWmsFeatInfoJson(response.data.features[0].properties);
            }
    
            // console.log(wmsFeatInfoJsonRef.current)
            // debugger
            // const parsed = response.json();
            // wmsFeatInfoJsonRef.current = createElement('div', null, parsed)
          });
        } 
    
        // console.log(url)
      }

      map.on("singleclick", settingWmsData);

      
      return () => {
        map.un("singleclick", settingWmsData)};
    }
  }, [map, addedLayer, wmsClicked])

  // Select Feature
  let select = null;

  const featureDefaultColor = "#00ee00";
  const selected = new Style({
    fill: new Fill({
      color: featureDefaultColor,
    }),
    stroke: new Stroke({
      color: featureDefaultColor,
      width: strokeWidth+3,
    }),
    image: new CircleStyle({
      fill: new Fill({
        color: featureDefaultColor,
      }),
      radius: pointRadius+3
    })
  });

  function selectStyle(feature) {
    const color = featureDefaultColor;
    selected.getFill().setColor(color);
    return selected;
  }

  const selectSingleClick = new Select({ style: selectStyle });

  const selectClick = new Select({
    condition: click,
    style: selectStyle,
  });

  selectClick.on("select", (e) => {
    // const keys = e.selected[0].getKeys()
    // console.log(keys)

    // const length = e.selected[0].getKeys().length
    // console.log(length)
//  && selectedId.includes(selectedLayer) === true
      if (e.selected[0] !== undefined) { // 우선 select로 인식되는 피처가 있는지 판별
        if(e.selected[0].getId()!== undefined) { // 그러고나서 그 피처가 id 값을 가지고있는지 판별 = db에 있는 레이어 띄운 경우인지 알아보려고 한 것
        setFeatureInfo(e.selected[0].getProperties());
        setFeatureDialogOpen(true);
        } else {
        }
      } else {
      }
    
    // const featureInfo = document.getElementById('#feature-info')

    // document.write('<table border="1">');
    // for (let tr = 1; tr <= length; tr++){
    //   document.write('<tr>')
    //   //for(let i = 0; i <= 1 ; i++) {
    //     const values = e.selected[0].get(keys[tr])
    //     document.write('<td>');
    //     document.write(keys[tr])
    //     document.write('</td>');
    //     document.write('<td>');
    //     document.write(values)
    //     document.write('</td>');
    //   //}
    //   document.write('</tr>')
    // }
    // document.write('</table>');

    // handleFeatureDialogOpen();
  });

  const selectPointerMove = new Select({
    condition: pointerMove,
    style: selectStyle,
  });

  const selectAltClick = new Select({
    style: selectStyle,
    condition: function (mapBrowserEvent) {
      return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
    },
  });

  const selectElement = document.getElementById("type");

  const changeInteraction = function () {
    if (select !== null) {
      map.removeInteraction(select);
    }
    const value = selectElement.value;
    if (value === "singleclick") {
      select = selectSingleClick;
    } else if (value === "click") {
      select = selectClick;
    } else if (value === "pointermove") {
      select = selectPointerMove;
    } else if (value === "altclick") {
      select = selectAltClick;
    } else {
      select = null;
    }
    if (select !== null) {
      map.addInteraction(select);
      select.on("select", function (e) {
        document.getElementById("status").innerHTML =
          "&nbsp;" +
          e.target.getFeatures().getLength() +
          " selected features (last operation selected " +
          e.selected.length +
          " and deselected " +
          e.deselected.length +
          " features)";
      });
    }
  };

  // Draggable한 style dialog 띄우기
  const paperComponent = (props) => {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  };

  const handleFeatureDialogClose = () => {
    setFeatureDialogOpen(false);
  };

  // #region start

  // #endregion start

  // 셀렉박스
  const layerNames = [
    "admin_emd",
    "admin_sgg",
    "admin_sid",
    "river",
    "road_link2",
    "subway_station",
    "subway",
  ];

  const tableStyle = { border: "1px solid #000000", padding: "2px" };

  return (
    <div>
      <div id="map" className="map" style={mapStyle} />

      {addedLayer instanceof TileLayer ? (
        wmsClicked === true ? (
          <div id="info_layer">
            <table style={tableStyle}>
              <thead></thead>
              <tbody>
                {Object.keys(wmsFeatInfoJson).map((item, idx) => {
                  return (
                    <tr key={idx} style={tableStyle}>
                      <td style={tableStyle}>{item}</td>
                      <td style={tableStyle}>{wmsFeatInfoJson[item]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null
      ) : null}

      <form>
        <label htmlFor="type">Action type &nbsp;</label>
        <select id="type">
          <option value="click">Click</option>
          <option value="singleclick">Single-click</option>
          <option value="pointermove">Hover</option>
          <option value="altclick">Alt+Click</option>
          <option value="none">None</option>
        </select>
        <span id="status">&nbsp;0 selected features</span>
        <div id="feature-info"></div>
      </form>

      <div id="measurement-tooltip"></div>

      <div>
        <button onClick={() => handleMeasurementTypeSelect("length")}>
          길이 측정
        </button>
        <button onClick={() => handleMeasurementTypeSelect("area")}>
          면적 측정
        </button>
        <button onClick={() => handleRemoveDrawVectorLayer()}>
          측정 도형 지우기
        </button>
      </div>


      <label for="segments">💫 부분 측정 보이기:&nbsp;</label>
      <input type="checkbox" id="segments" checked={segmentChecked} onChange={handleSegment}/>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label for="clear">💫 이전 측정 기록 지우기:&nbsp;</label>
      <input type="checkbox" id="clear" checked={clearPreviousChecked} onChange={handleClearPrevious} />

      <div>
        <select value={selectedLayer} onChange={handleLayerSelectChange}>
          <option value="beforeSelectLayer">레이어 종류를 선택하세요</option>
          {layerNames.map((l, idx) => (
            <option key={idx} value={l}>
              {l}
            </option>
          ))}
        </select>
        <button onClick={() => handleLayerTypeChange("tile")}>
          타일로 보기
        </button>
        <button onClick={() => handleLayerTypeChange("vector")}>
          벡터로 보기
        </button>

        {filterButton ? (
          <>
            <br />
            <br />
            <p>[레이어 필터링하기]</p>

            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
              }}
            >
              <option default selected>
                {" "}
                연도 선택
              </option>
              <option value="pop2007">2007년</option>
              <option value="pop2008">2008년</option>
            </select>
            <span>&nbsp;인구수가 &nbsp;</span>
            <input
              type="text"
              placeholder="입력 후 Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  filterRef.current = filterYear + " > " + e.target.value;
                  setFilter(filterRef.current);
                  console.log(filter);
                  // console.log(filterRef.current)
                  setLayerType("tile");
                  onChangeLayerStyle(layerType, filterRef.current);
                  e.target.value = null;
                }
              }}
            ></input>
            <span>보다 많은 지역</span>
          </>
        ) : null}
        {displayStyleButton ? (
          <button onClick={() => handleLayerStyleDialogOpen()}>
            레이어 스타일 바꾸기
          </button>
        ) : null}

        {layerStyleDialogOpen === true ? (
          <Dialog open={layerStyleDialogOpen} aria-labelledby="dialog-title">
            <DialogTitle id="dialog-title"></DialogTitle>
            <DialogContent style={dialogSize}>
              {addedLayer
                .getSource()
                .getFeatures()[0]
                .getGeometry()
                .getType() === "MultiPolygon" ? (
                <>
                  <div>
                    면 색상 변경 &nbsp;
                    <div
                      style={fillColorBarStyles.swatch}
                      onClick={handleFillPickerOpen}
                    >
                      <div
                        id="showCurLayColor"
                        style={fillColorBarStyles.color}
                      />
                    </div>
                    {displayFillPicker ? (
                      <div style={fillColorBarStyles.popover}>
                        <div
                          style={fillColorBarStyles.cover}
                          onClick={handleFillColorPickerClose}
                        />
                        <SketchPicker
                          color={fillColorStyle.color}
                          onChange={(color) => handleFillColorChange(color)}
                        />
                      </div>
                    ) : null}
                  </div>

                  <>
                    <div>
                      선 색상 변경 &nbsp;
                      <div
                        style={strokeColorBarStyles.swatch}
                        onClick={handleStrokePickerOpen}
                      >
                        <div style={strokeColorBarStyles.color}></div>
                      </div>
                      {displayStrokePicker ? (
                        <div style={strokeColorBarStyles.popover}>
                          <div
                            style={strokeColorBarStyles.cover}
                            onClick={handleStrokePickerClose}
                          ></div>
                          <SketchPicker
                            color={strokeColorStyle.color}
                            onChange={(color) => handleStrokeColorChange(color)}
                          ></SketchPicker>
                        </div>
                      ) : null}
                    </div>

                    <br />

                    <div id="stroke-width">
                      선 굵기 변경 &nbsp;
                      <Box sx={{ width: 180 }}>
                        <Slider
                          aria-label="Temperature"
                          defaultValue={2}
                          getAriaValueText={strokeWidthSliderValue}
                          valueLabelDisplay="auto"
                          shiftStep={30}
                          step={1}
                          marks
                          min={0}
                          max={10}
                        />
                      </Box>
                    </div>
                  </>
                </>
              ) : null}

              <br />
              {addedLayer
                .getSource()
                .getFeatures()[0]
                .getGeometry()
                .getType() === "MultiLineString" ? (
                <>
                  <div>
                    선 색상 변경 &nbsp;
                    <div
                      style={strokeColorBarStyles.swatch}
                      onClick={handleStrokePickerOpen}
                    >
                      <div style={strokeColorBarStyles.color}></div>
                    </div>
                    {displayStrokePicker ? (
                      <div style={strokeColorBarStyles.popover}>
                        <div
                          style={strokeColorBarStyles.cover}
                          onClick={handleStrokePickerClose}
                        ></div>
                        <SketchPicker
                          color={strokeColorStyle.color}
                          onChange={(color) => handleStrokeColorChange(color)}
                        ></SketchPicker>
                      </div>
                    ) : null}
                  </div>

                  <br />

                  <div id="stroke-width">
                    선 굵기 변경 &nbsp;
                    <Box sx={{ width: 180 }}>
                      <Slider
                        aria-label="Temperature"
                        defaultValue={2}
                        getAriaValueText={strokeWidthSliderValue}
                        valueLabelDisplay="auto"
                        shiftStep={30}
                        step={1}
                        marks
                        min={0}
                        max={10}
                      />
                    </Box>
                  </div>
                </>
              ) : null}

              <br />

              {addedLayer
                .getSource()
                .getFeatures()[0]
                .getGeometry()
                .getType() !== "MultiLineString" ? (
                addedLayer
                  .getSource()
                  .getFeatures()[0]
                  .getGeometry()
                  .getType() === "Point" ? (
                  <>
                    {" "}
                    <div>
                      포인트 색상 변경 &nbsp;
                      <div
                        style={pointFillColorBarStyles.swatch}
                        onClick={handlePointPickerOpen}
                      >
                        <div style={pointFillColorBarStyles.color}></div>
                      </div>
                      {displayPointPicker ? (
                        <div style={pointFillColorBarStyles.popover}>
                          <div
                            style={pointFillColorBarStyles.cover}
                            onClick={handlePointPickerClose}
                          ></div>
                          <SketchPicker
                            color={pointFillColorStyle.color}
                            onChange={(color) => handlePointColorChange(color)}
                          ></SketchPicker>
                        </div>
                      ) : null}
                    </div>
                    <br />
                    <div id="point-radius" className="container">
                      <div className="row">
                        <div className="col-6">포인트 크기 변경</div>
                        <div className="col-6">
                          <Box sx={{ width: 180 }}>
                            <Slider
                              aria-label="Temperature"
                              defaultValue={7}
                              getAriaValueText={pointRadiusSliderValue}
                              valueLabelDisplay="auto"
                              shiftStep={30}
                              step={1}
                              marks
                              min={0}
                              max={20}
                            />
                          </Box>
                        </div>
                      </div>
                    </div>
                    <br />
                    <div>
                      포인트 테두리 색상 변경 &nbsp;
                      <div
                        style={pointStrokeColorBarStyles.swatch}
                        onClick={handlePointStrokePickerOpen}
                      >
                        <div style={pointStrokeColorBarStyles.color}></div>
                      </div>
                      {displayPointStrokePicker ? (
                        <div style={pointStrokeColorBarStyles.popover}>
                          <div
                            style={pointStrokeColorBarStyles.cover}
                            onClick={handlePointStrokePickerClose}
                          ></div>
                          <SketchPicker
                            color={pointStrokeColorStyle.color}
                            onChange={(color) =>
                              handlePointStrokeColorChange(color)
                            }
                          ></SketchPicker>
                        </div>
                      ) : null}
                    </div>
                    <br />
                    <div id="point-troke-width">
                      포인트 테두리 굵기 변경 &nbsp;
                      <Box sx={{ width: 180 }}>
                        <Slider
                          aria-label="Temperature"
                          defaultValue={2}
                          getAriaValueText={pointStrokeWidthSliderValue}
                          valueLabelDisplay="auto"
                          shiftStep={30}
                          step={1}
                          marks
                          min={0}
                          max={10}
                        />
                      </Box>
                    </div>
                  </>
                ) : null
              ) : null}

              <br />
            </DialogContent>
            <DialogActions>
              <button autoFocus onClick={handleLayerDialogClose}>
                close
              </button>
              <button id="layerStyleChanged" onClick={handleLayerDialogSave}>
                save
              </button>
            </DialogActions>
          </Dialog>
        ) : null}
      </div>

      {featureDialogOpen === true ? (
        <Dialog
          open={featureDialogOpen}
          onClose={handleFeatureDialogClose}
          PaperComponent={paperComponent}
          aria-labelledby="draggable-dialog-title"
          style={dialogSize}
        >
          <DialogTitle
            style={{ cursor: "move" }}
            id="draggable-dialog-title"
          ></DialogTitle>
          <DialogContent>
            <table style={tableStyle}>
              <thead></thead>
              <tbody>
                {Object.keys(featureInfo).map((item, idx) => {
                  if (item.indexOf("geom") === -1) {
                    return (
                      <tr key={idx} style={tableStyle}>
                        <td style={tableStyle}>{item}</td>
                        <td>{featureInfo[item]}</td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleFeatureDialogClose}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
}
