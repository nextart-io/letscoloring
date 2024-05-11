import Image from "next/image";
const MainPage = () => {
  return (
    <div className="flex justify-center">
        <Image src={"/images/Tothemoon.png"} alt={""} width={"600"} height={"600"}></Image>
    </div>
  );
};

export default MainPage;
