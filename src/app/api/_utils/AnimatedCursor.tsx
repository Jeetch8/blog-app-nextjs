import React from 'react';
import AnimatedCursor from 'react-animated-cursor';

const CustomeCursor = () => {
  return (
    <AnimatedCursor
      color="255, 255, 255"
      innerSize={8}
      outerSize={25}
      innerScale={1.5}
      outerScale={1.7}
      outerAlpha={1}
      trailingSpeed={5}
      showSystemCursor={false}
      outerStyle={{
        mixBlendMode: 'exclusion',
      }}
    />
  );
};

export default CustomeCursor;
