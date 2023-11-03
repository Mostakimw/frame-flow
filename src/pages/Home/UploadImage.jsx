// import { ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { storage } from "../../firebase/config";

const UploadImage = () => {
  const [images, setImages] = useState(null);
  //   console.log(images);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  console.log(imageUrls);

  //   console.log("image urls", imageUrls);

  const imageTypes = ["image/png", "image/jpeg", "image/webp"];

  const imagesListRef = ref(storage, "images/");

  const handleUpload = (e) => {
    e.preventDefault();
    // check if image selected and match the image type
    if (images && imageTypes.includes(images.type)) {
      console.log("inside if");
      setError("");
      // Create a reference to the storage location where you want to store the image
      const storageRef = ref(storage, `images/${images.name + v4()}`);
      uploadBytes(storageRef, images).then((snapshot) => {
        console.log("file uplaoded", snapshot);
        getDownloadURL(snapshot.ref).then((url) => {
          //   console.log(url);
          setImageUrls((prev) => [...prev, url]);
        });
      });
    }
  };

  //   getting all images
  useEffect(() => {
    listAll(imagesListRef).then((res) => {
      const urls = [];
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          urls.push(url);
          // When all URLs are retrieved, update the state once
          if (urls.length === res.items.length) {
            setImageUrls(urls);
          }
        });
      });
    });
  }, []);

  return (
    <div>
      <form>
        <input
          type="file"
          onChange={(event) => {
            setImages(event.target.files[0]);
          }}
        />
        {error && <div className="error">{error}</div>}
        <button onClick={handleUpload}> Upload Image</button>
      </form>
      <div className="grid grid-cols-4 gap-5 ">
        {imageUrls.map((image, index) => (
          <div
            key={index}
            className={`relative rounded-md  ${
              index === 0
                ? "col-span-2 row-span-2 border-blue-500"
                : "border border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              className="absolute top-3 left-3 z-10 w-5 h-5"
            />
            <div className="relative group">
              <img
                src={image}
                alt="Uploaded Image"
                className="object-cover border-2 rounded-sm"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImage;
