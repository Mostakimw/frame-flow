import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
const Images = ({
  index,
  selectedImage,
  setHoveredImageIndex,
  hoveredImageIndex,
  handleImageSelection,
  image,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative rounded-lg ${
        index === 0
          ? "col-span-2 row-span-2 border-blue-500"
          : "border border-gray-300"
      } ${selectedImage.includes(index) && "opacity-70"} `}
      onMouseEnter={() => setHoveredImageIndex(index)}
      onMouseLeave={() => setHoveredImageIndex(null)}
    >
      {/* checkbox for selecting image include hover and after selection  */}
      {hoveredImageIndex === index && (
        <input
          type="checkbox"
          checked={selectedImage.includes(index)}
          onChange={() => handleImageSelection(index)}
          className="absolute top-3 left-3 z-10 w-5 h-5 cursor-pointer"
        />
      )}
      {selectedImage.includes(index) && (
        <>
          <input
            className="absolute top-3 left-3 z-10 w-5 h-5 cursor-pointer"
            type="checkbox"
            checked={selectedImage.includes(index)}
            onChange={() => handleImageSelection(index)}
          />
        </>
      )}
      {/* single image rendered here in this div  */}
      <div className="relative group">
        <img
          src={image}
          alt="Uploaded Image"
          className="object-cover border-2 rounded-lg"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default Images;
