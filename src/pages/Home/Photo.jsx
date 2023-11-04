import { forwardRef } from "react";

// eslint-disable-next-line react/display-name
export const Photo = forwardRef(
  // eslint-disable-next-line react/prop-types
  ({ url, index, faded, style, ...props }, ref) => {
    const inlineStyles = {
      opacity: faded ? "0.2" : "2",
      transformOrigin: "0 0",
      height: index === 0 ? 410 : 400,
      gridRowStart: index === 0 ? "span 2" : null,
      gridColumnStart: index === 0 ? "span 2" : null,
      backgroundImage: `url("${url}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: "grey",
      ...style,
    };

    return <div ref={ref} style={inlineStyles} {...props} />;
  }
);
