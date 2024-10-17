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
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  const sendFile = async () => {
    try {
      if (image) {
        setIsloading(true);

        let formData = new FormData();
        formData.append("file", selectedFile);
        let res = await axios({
          method: "post",
          url: "https://dog-disease-classification.onrender.com/predict",
          data: formData,
        });
        setData(res.data);
      }
    } catch (error) {
      if (error?.response) {
        alert(error?.response?.data?.detail);
        clearData();
      } else {
        alert("An error occurred. Please try again.");
        clearData();
      }
    } finally {
      setIsloading(false);
    }
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
    const file = e.target?.files?.[0];
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(
          "File size should be less than 2 MB. Please select a smaller file."
        );
        clearData(); // Clear the selected file if it exceeds the limit
        return;
      }
      setSelectedFile(file);
      setData(undefined);
      setImage(true);
    }
  };

  return (
    <div className="main">
      <h1>Parasitic Dermatoses</h1>
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
          {data.class === "Demodecosis" || data.class === "Scabies" ? (
            <span>
              Class: <b style={{ color: "orange" }}>{data.class}</b>
            </span>
          ) : (
            <span>
              Class: <b style={{ color: "orange" }}>Negative</b>
              <br />
              <p>(Not comes under parasitic dermatoses)</p>
            </span>
          )}
          <br />
          {data.class === "Demodecosis" || data.class === "Scabies" ? (
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
              {" of "}
              <b>{data.class}</b>
            </span>
          )}
        </div>
      )}

      <div className="mainAction">
        <button onClick={sendFile} style={{ width: "80px" }}>
          {" "}
          {isLoading ? <Loader size={15} /> : "SUBMIT"}
        </button>
        <button onClick={clearData}>CLEAR</button>
      </div>
    </div>
  );
}

export default App;
