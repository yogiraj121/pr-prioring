import React from "react";

const LoadingSkeleton = ({ type = "line", count = 1, height = "20px" }) => {
  const skeletonStyle = {
    base: {
      backgroundColor: "#e2e8f0",
      borderRadius: "4px",
      animation: "pulse 1.5s ease-in-out infinite",
      margin: "8px 0",
    },
    line: {
      height: height,
      width: "100%",
    },
    circle: {
      height: "40px",
      width: "40px",
      borderRadius: "50%",
    },
    card: {
      height: "100px",
      width: "100%",
    },
  };

  const keyframes = `
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
      100% {
        opacity: 1;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          style={{
            ...skeletonStyle.base,
            ...skeletonStyle[type],
          }}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;
