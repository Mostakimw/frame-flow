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
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const Gallery = () => {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);

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

  // Drag-and-drop handler
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedImages = Array.from(imageUrls);
    const [reorderedItem] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, reorderedItem);

    setImageUrls(reorderedImages);
  };

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
        <button
          onClick={handleUpload}
          className="bg-blue-500 px-3 py-2 rounded-md text-xl transition-all shadow-md hover:bg-blue-600 duration-300 text-white"
        >
          Import Image
        </button>
      </form>
      {/* delete btn  */}
      <div className="flex gap-11">
        <button
          onClick={handleImageDelete}
          className="bg-red-500 px-3 py-2 rounded-md text-xl transition-all shadow-md hover:bg-red-600 duration-300 text-white"
        >
          Delete Image
        </button>
        <p className="bg-gray-400 p-2 rounded-md text-white w-fit">
          {selectedImage.length} Selected
        </p>
      </div>
      {/* gallery container  */}
      <div className="mt-16">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="md:grid grid-cols-4 gap-5"
              >
                {imageUrls.map((image, index) => (
                  <Draggable
                    key={index}
                    draggableId={index.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative rounded-lg ${
                          index === 0
                            ? "col-span-2 row-span-2 border-blue-500"
                            : "border border-gray-300"
                        } ${selectedImage.includes(index) && "opacity-50"}`}
                        onMouseEnter={() => setHoveredImageIndex(index)}
                        onMouseLeave={() => setHoveredImageIndex(null)}
                      >
                        {hoveredImageIndex === index && (
                          <input
                            type="checkbox"
                            checked={selectedImage.includes(index)}
                            onChange={() => handleImageSelection(index)}
                            className="absolute top-3 left-3 z-10 w-5 h-5"
                          />
                        )}
                        {selectedImage.includes(index) && (
                          <>
                            <input
                              className="absolute top-3 left-3 z-10 w-5 h-5 "
                              type="checkbox"
                              checked={selectedImage.includes(index)}
                              onChange={() => handleImageSelection(index)}
                            />
                          </>
                        )}
                        <div className="relative group">
                          <img
                            src={image}
                            alt="Uploaded Image"
                            className="object-cover border-2 rounded-lg"
                          />
                          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Gallery;
