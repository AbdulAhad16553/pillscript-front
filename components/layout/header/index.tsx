import Image from "next/image";
import React from "react";

const Header = () => {
  return (
    <div className="flex flex-col px-4">
      <Image
        src="/assets/images/rx_logo.png"
        width={50}
        height={50}
        alt=""
        className="object-contain"
      />
    </div>
  );
};

export default Header;
