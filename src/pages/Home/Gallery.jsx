import { useEffect, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";
import { v4 } from "uuid";
import { storage } from "../../firebase/config";

const Gallery = () => {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);

  const imageTypes = ["image/png", "image/jpeg", "image/webp"];

  const imagesListRef = ref(storage, "images/");

  //   uploading image handler
  const handleUpload = (e) => {
    e.preventDefault();

    // check if image selected and match the image type
    if (images && imageTypes.includes(images.type)) {
      console.log("inside if");
      setError("");

      // reference to the storage location
      const storageRef = ref(storage, `images/${images.name + v4()}`);
      uploadBytes(storageRef, images).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    }
  };

  // handling image selection
  const handleImageSelection = (index) => {
    if (selectedImage.includes(index)) {
      setSelectedImage(selectedImage.filter((i) => i !== index));
    } else {
      setSelectedImage([...selectedImage, index]);
    }
  };

  // handle image deletion
  const handleImageDelete = async () => {
    const updatedImages = [...imageUrls];

    for (const index of selectedImage) {
      const imageUrl = imageUrls[index];
      const imageRef = ref(storage, imageUrl);

      try {
        // Delete the image
        await deleteObject(imageRef);

        // Remove the deleted image from the copy of imageUrls
        updatedImages.splice(index, 1);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Update the imageUrls state
    setImageUrls(updatedImages);

    setSelectedImage([]);
  };

  // getting all images
  useEffect(() => {
    listAll(imagesListRef).then((res) => {
      const urls = [];
      res.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          urls.push(url);
          // When all URLs are retrieved, updating the state once
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
        {/* image upload input field  */}
        <input
          type="file"
          onChange={(event) => {
            setImages(event.target.files[0]);
          }}
        />
        {error && <div className="error">{error}</div>}
        <button onClick={handleUpload}> Upload Image</button>
      </form>
      <button onClick={handleImageDelete}>Delete Image</button>
      {/* gallery container  */}
      <div>
        <div className="grid grid-cols-4 gap-5 ">
          {imageUrls.map((image, index) => (
            // <Gallery
            //   key={index}
            //   index={index}
            //   image={image}
            //   handleImageSelection={handleImageSelection}
            //   selectedImage={selectedImage}
            // />
            <div
              key={index}
              className={`relative rounded-md  ${
                index === 0
                  ? "col-span-2 row-span-2 border-blue-500"
                  : "border border-gray-300"
              }`}
            >
              {/* checkbox input  */}
              <input
                type="checkbox"
                checked={selectedImage.includes(index)}
                onChange={() => handleImageSelection(index)}
                className="absolute top-3 left-3 z-10 w-5 h-5"
              />

              {/* single image rendering here  */}
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
    </div>
  );
};

export default Gallery;
