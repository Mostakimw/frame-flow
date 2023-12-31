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
import { ImCheckboxChecked, ImPlus } from "react-icons/im";
import toast from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import Images from "./Images";
import { Photo } from "./Photo";
import Loading from "../../components/Loading";

const Gallery = () => {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const imageTypes = ["image/png", "image/jpeg", "image/webp"];

  const imagesListRef = ref(storage, "images/");

  // stop propagation when try to handling action in Draggable area
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  //   uploading image handler
  const handleUpload = (e) => {
    e.preventDefault();

    // check if image selected and match the image type
    if (images && imageTypes.includes(images.type)) {
      setError("");

      // reference to the storage location
      const storageRef = ref(storage, `images/${images.name + v4()}`);
      uploadBytes(storageRef, images).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          toast.success("Image Uploaded");
          setImageUrls((prev) => [...prev, url]);
          document.getElementById("imageUploadInput").value = "";
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

        // delete toast
        toast.success("Deleted", {
          style: {
            border: "1px solid #713200",
            padding: "16px",
            color: "#713200",
          },
          iconTheme: {
            primary: "#713200",
            secondary: "#FFFAEE",
          },
        });
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
  // cannot use dependencies because of infinite loop

  // handle drag starting
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // handle drag ending
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setImageUrls((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  // handle drag cancel
  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <>
      <div>
        <form className="md:flex justify-center gap-4 space-y-3 md:space-y-0 mb-12">
          {/* image upload input field  */}
          <input
            className="relative m-0 block cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-black transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-black file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-gray-700 focus:border-primary focus:text-black focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-black dark:file:bg-blue-700 dark:file:text-neutral-100 dark:focus:border-primary"
            id="imageUploadInput"
            type="file"
            onChange={(event) => {
              setImages(event.target.files[0]);
            }}
          />

          {error && <div className="error">{error}</div>}
          <button
            onClick={handleUpload}
            className="flex gap-2 items-center bg-blue-500 px-3 py-2 rounded-md text-xl transition-all shadow-md hover-bg-blue-600 duration-300 text-white"
          >
            <ImPlus></ImPlus> Import Image
          </button>
        </form>
        {/* delete btn  */}
        {selectedImage.length > 0 && (
          <div className="md:flex gap-11 justify-between max-lg:mt-10 space-y-3 md:space-y-0">
            <button
              onClick={handleImageDelete}
              className="bg-red-500 px-3 py-2  rounded-md text-xl transition-all shadow-md hover-bg-red-600 duration-300 text-white"
            >
              Delete Image
            </button>
            <p className="bg-gray-100 px-3 py-2 rounded-md  w-fit flex gap-3 text-base font-semibold items-center ">
              <ImCheckboxChecked></ImCheckboxChecked> {selectedImage.length}{" "}
              Selected
            </p>
          </div>
        )}
        {/* gallery container  */}
        {imageUrls.length === 0 ? (
          <Loading />
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xxl:grid-cols- gap-8 ">
            {/* dnd context  */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {/* sortable context for sortable images  */}
              <SortableContext items={imageUrls} strategy={rectSortingStrategy}>
                {imageUrls.map((image, index) => (
                  // all images rendering here
                  <Images
                    key={image}
                    id={image}
                    index={index}
                    image={image}
                    selectedImage={selectedImage}
                    setHoveredImageIndex={setHoveredImageIndex}
                    hoveredImageIndex={hoveredImageIndex}
                    handleImageSelection={handleImageSelection}
                  ></Images>
                ))}
              </SortableContext>

              {/* drag overlay when dragging  */}
              <DragOverlay adjustScale={true}>
                {activeId ? (
                  <Photo url={activeId} index={imageUrls.indexOf(activeId)} />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </>
  );
};

export default Gallery;
