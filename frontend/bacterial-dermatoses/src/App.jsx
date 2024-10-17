import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Loader, Upload } from "lucide-react";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const imageRef = useRef(null);

  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      let res = await axios({
        method: "post",
        url: "http://localhost:8000/predict",
        data: formData,
      });
      setData(res.data);
      setIsloading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (e.target?.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setData(undefined);
      setImage(true);
    }
  };

  console.log("data", data);

  return (
    <div className="main">
      <h1>Bacterial Dermatoses</h1>
      <div className="mainUpload" onClick={() => imageRef.current.click()}>
        {!image && (
          <>
            <input
              ref={imageRef}
              type="file"
              onChange={(e) => onSelectFile(e)}
              hidden
            />

            <div className="mainUploadInner">
              <Upload />
              <h4>Upload</h4>
            </div>
          </>
        )}

        {image && (
          <img
            style={{ height: "300px", width: "100%", objectFit: "cover" }}
            src={preview}
            alt=""
          />
        )}
      </div>

      {data && (
        <div>
          {data.class === "Pyoderma" ? (
            <span>
              Class: <b style={{ color: "orange" }}>{data.class}</b>
            </span>
          ) : (
            <span>
              {/* Class:{" "} */}
              <b>Not comes under bacterial dermatoses</b>
            </span>
          )}
          <br />
          {data.class === "Pyoderma" ? (
            <span>
              Level of:{" "}
              <b style={{ color: "#0091ff" }}>
                {data.confidence.toFixed(4) * 100}%
              </b>
            </span>
          ) : (
            <span>
              Confidence Level:{" "}
              <b style={{ color: "#0091ff" }}>
                {data.confidence.toFixed(4) * 100}%
              </b>
            </span>
          )}
        </div>
      )}

      <div className="mainAction">
        <button onClick={sendFile}>
          {" "}
          {isLoading ? <Loader size={15} /> : "SUBMIT"}
        </button>
        <button onClick={clearData}>CLEAR</button>
      </div>
    </div>
  );
}

export default App;
