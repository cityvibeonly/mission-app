import { useEffect, useState } from "react";
import Draw from "ol/interaction/Draw.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import View from "ol/View.js";
import Select from "ol/interaction/Select.js";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style.js";
import { OSM, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { getArea, getLength } from "ol/sphere.js";
import GeoJSON from "ol/format/GeoJSON.js";
import TileWMS from "ol/source/TileWMS.js";
import { bbox } from "ol/loadingstrategy.js";
import { SketchPicker } from "react-color";
import reactCSS from "reactcss";
import { altKeyOnly, click, pointerMove } from "ol/events/condition.js";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
// import ImageWMS from "ol/source/ImageWMS.js";
// import ImageLayer from "ol/layer/Image.js";

export default function MainMap() {
  const mapStyle = {
    width: 1300,
    height: 550,
  };



  const [map, setMap] = useState("");
  const [measurementType, setMeasurementType] = useState(""); // 'length' or 'area'
  const [selectedLayer, setSelectedLayer] = useState("");
  const [layerType, setLayerType] = useState(""); // 'tile' or 'vector'
  const [drawInteraction, setDrawInteraction] = useState("");
  const [measurementOverlay, setMeasurementOverlay] = useState("");
  const [addedLayer, setAddedLayer] = useState("");
  const [featureDialogOpen, setDialogOpen] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [colorStyle, setColorStyle] = useState({
    color: {
      r: "241",
      g: "112",
      b: "19",
      a: "1",
    },
  });
  const [widthStyle, setWidthStyle] = useState({
    width: 2,
  });
  const [dialogSize, setDialogSize] = useState({
    width: 1000,
    height: 1000,
  });
  const [featureInfo, setFeatureInfo] = useState([]);
  const [displayStyleButton, setDisplayStyleButton] = useState(false);
  const [layerDialogOpen, setLayerDialogOpen] = useState(false);

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
        view: new View({
          center: [14134735.270495, 4518651.364106],
          zoom: 11,
          minZoom: 5.5,
          maxZoom: 20,
        }),
      });

      setMap(newMap);
    }

    return () => {
      if (map) {
        map.dispose();
      }
    };
  }, [map]);

  // 오버레이 띄우기
  useEffect(() => {
    if (map && measurementType && !measurementOverlay) {
      const overlay = new Overlay({
        offset: [10, 0],
        positioning: "bottom-left",
      });
      map.addOverlay(overlay);
      setMeasurementOverlay(overlay);
    }
  }, [map, measurementType, measurementOverlay]);

  // 측정 인터랙션 추가
  useEffect(() => {
    if (map && measurementType) {
      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }

      const drawLayer = new VectorLayer({
        source: new VectorSource(),
      });

      map.addLayer(drawLayer);

      const draw = new Draw({
        source: drawLayer.getSource(),
        type: measurementType === "area" ? "Polygon" : "LineString",
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)",
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33",
            }),
          }),
        }),
      });

      map.addInteraction(draw);
      setDrawInteraction(draw);

      let sketch;
      draw.on("drawstart", (event) => {
        sketch = event.feature;
      });

      draw.on("drawend", () => {
        const geometry = sketch.getGeometry();
        const type = geometry.getType();
        let measurement;
        let tooltipCoord;
        if (type === "LineString") {
          measurement = getLength(geometry);
          tooltipCoord = geometry.getLastCoordinate();
        } else if (type === "Polygon") {
          measurement = getArea(geometry);
          tooltipCoord = geometry.getInteriorPoint().getCoordinates();
        }
        const output =
          type === "LineString"
            ? `${measurement.toFixed(2)} km`
            : `${measurement.toFixed(2)} m²`;
        measurementOverlay.setElement(createMeasurementElement(output));
        measurementOverlay.setPosition(tooltipCoord);
        map.removeInteraction(draw);
      });
    }
  }, [map, measurementType, measurementOverlay]);

  // 측정 관련 메서드
  const handleMeasurementTypeChange = (type) => {
    setMeasurementType(type);
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

  // 레이어 유형 전환
  const handleLayerTypeChange = (type) => {
    setLayerType(type);
  };

  // 타일 생성
  const createTileLayer = (layerName) => {
    console.log("tile");
    const extent = [
      14062120.093624081, 4488076.55279193, 14207350.447365917,
      4549226.175420071,
    ];
    return new TileLayer({
      extent: extent,
      source: new TileWMS({
        url: "http://127.0.0.1:8080/geoserver/foss/wms",
        params: { LAYERS: `foss:${layerName}`, TILED: true },
      }),
      serverType: "geoserver",
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

  // 벡터 기본 스타일 지정
  const style = new Style({
    fill: new Fill({
      color: "#eeeeee",
    }),
    stroke: new Stroke({
      color: "#000000",
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "#000000",
      }),
    }),
  });

  // 벡터 생성
  const createVectorLayer = (layerName) => {
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      loader: function (extent, resolution, projection) {
        const proj = projection.getCode();
        const url =
          "http://localhost:8080/geoserver/foss/ows?service=WFS&version=1.0.0&request=GetFeature&typename=foss:" +
          layerName +
          "&outputFormat=application/json&srsname=" +
          proj +
          "&bbox=" +
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
      style: style,

      // Style Function 사용하기
      // function (feature) {
      // const fillColor = '#ee00ee';
      // const strokeColor = '#0e0ee0';
      //   const strokeWidth = 2;
      //   // debugger;
      // style.getFill().setColor(fillColor);
      // style.getStroke().setColor(strokeColor);
      // style.getStroke().setWidth(strokeWidth);
      //   //style.getImage().setColor(strokeColor);
      //   style.getImage(new CircleStyle({
      //     radius: 5,
      //     fill: new Fill({
      //       color: 'red'
      //     })
      //   }))

      //   return style;
      // }
    });
  };

  // map에 레이어 추가
  useEffect(() => {
    if (map && selectedLayer && layerType) {
      // 이미 추가된 레이어 있는 경우 모든 레이어 제거
      if (addedLayer) {
        map.removeLayer(addedLayer);
      }

      let layer;
      if (layerType === "tile") {
        layer = createTileLayer(selectedLayer);
      } else if (layerType === "vector") {
        layer = createVectorLayer(selectedLayer);
      } else {
      }

      // 만들어진 레이어를 addLayer로 세팅
      setAddedLayer(layer);

      // 새로운 레이어 추가
      map.addLayer(layer);

      // 해당레이어의 스타일을 변경하는 버튼 표출
      setDisplayStyleButton(true);

      selectElement.onchange = changeInteraction;
      changeInteraction();
    }
  }, [map, selectedLayer, layerType]);


  // Select Feature
  let select = null;

  const selected = new Style({
    fill: new Fill({
      color: '#000000',
    }),
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  });

    function selectStyle(feature) {
      const color = '#000000';
      selected.getFill().setColor(color);
      return selected;
    }

  const selectSingleClick = new Select({ style: selectStyle });

  const selectClick = new Select({
    condition: click,
    style: selectStyle,
  });
  selectClick.on("select", (e) => {
    console.log(e.selected)
    const selectedFeature = e.selected
    setFeatureInfo(selectedFeature)
    console.log(featureInfo)
    handleDialogOpen();
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
    if (value == "singleclick") {
      select = selectSingleClick;
    } else if (value == "click") {
      select = selectClick;
    } else if (value == "pointermove") {
      select = selectPointerMove;
    } else if (value == "altclick") {
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

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // react-color
  const handleClick = () => {
    setDisplayColorPicker(true);
    console.log("color clicked");
    setDialogSize({
      width: "3000",
      height: "3000",
    });
  };

  const handleColorChange = (color) => {
    setColorStyle({ color: color.rgb });
    handleClose();
  };

    const newSelected = {
    fill: {
      color: `rgba(${colorStyle.color.r}, ${colorStyle.color.g}, ${colorStyle.color.b}, ${colorStyle.color.a})`,
    },
    // stroke: {
    //   color: `rgba(${colorStyle.color.r}, ${colorStyle.color.g}, ${colorStyle.color.b}, ${colorStyle.color.a})`,
    //   width: 2,
    // },
    // image: 
    //   {type: 
    //     {
    //       radius: 7,
    //       fill: {
    //         color: `rgba(${colorStyle.color.r}, ${colorStyle.color.g}, ${colorStyle.color.b}, ${colorStyle.color.a})`,
    //       },
    //     },
    //   }
  };

  const handleDialogSave = () => {

    setDialogOpen(false);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${colorStyle.color.r}, ${colorStyle.color.g}, ${colorStyle.color.b}, ${colorStyle.color.a})`,
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

  // slider
  const valuetext = (value) => {
    return `${value}`;
  };

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


  const handleLayerStyleDialog = () => {

  }

  return (
    <div>
      <div id="map" className="map" style={mapStyle} />
      <form>
        <label for="type">Action type &nbsp;</label>
        <select id="type">
          <option value="click" selected>
            Click
          </option>
          <option value="singleclick">Single-click</option>
          <option value="pointermove">Hover</option>
          <option value="altclick">Alt+Click</option>
          <option value="none">None</option>
        </select>
        <span id="status">&nbsp;0 selected features</span>
      </form>

      <div id="measurement-tooltip"></div>

      <div>
        <button onClick={() => handleMeasurementTypeChange("length")}>
          길이 측정
        </button>
        <button onClick={() => handleMeasurementTypeChange("area")}>
          면적 측정
          
        </button>
        <button>측정도형삭제</button>
      </div>

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
        {displayStyleButton ? (<button
        onClick={() => handleLayerStyleDialog()}>
          레이어 스타일 바꾸기
          {layerDialogOpen ? (<Dialog></Dialog>) : null}
        </button>) : null}
      </div>

      {featureDialogOpen === true ? (
        <Dialog
          open={featureDialogOpen}
          onClose={handleDialogClose}
          PaperComponent={paperComponent}
          aria-labelledby="draggable-dialog-title"
          style={dialogSize}
        >
          <DialogTitle
            style={{ cursor: "move" }}
            id="draggable-dialog-title"
          ></DialogTitle>
          <DialogContent>
            <span>면 색상 변경</span>
            <div id="polygon_color">
              <div style={styles.swatch} onClick={handleClick}>
                <div id="showCurColor" style={styles.color} />
              </div>
              {displayColorPicker ? (
                <div style={styles.popover}>
                  <div style={styles.cover} onClick={handleDialogClose} />
                  <SketchPicker
                    color={colorStyle.color}
                    onChange={(color) => handleColorChange(color)}
                  />
                </div>
              ) : null}
            </div>
            <span>선 색 변경</span>
            <div id="line_color"></div>
            <span>선 굵기 변경</span>
            <div id="line_stroke">
              <Box sx={{ width: 100 }}>
                <Slider
                  defaultValue={2}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="auto"
                  shiftStep={30}
                  step={1}
                  marks
                  min={0}
                  max={10}
                />
              </Box>
            </div>
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleDialogSave}>Save</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
}
