// Sample product data
const products = [
  {
    id: 1,
    name: "Levi 'FRAGILE' RAW DENIM Straight Jeans",
    price: 69.99,
    image: "/thumbnail_jeanfront.png",
    images: [
      "/thumbnail_jeanfront.png",
      "/thumbnail_jeanback.png",
      "/IMG_0153.JPG",
      "/thumbnail_IMG_0565.jpg"
    ],
    category: "Jeans",
    description: "Premium straight fit jean with classic design and modern comfort. Size 32\" waist available.",
    size: "32\"",
    sizeGuide: "Straight Fit",
    inStock: true
  },
  {
    id: 2,
    name: "Double Waist Jeans",
    price: 79.99,
    image: "/39e15cc1-5a9e-4e69-851c-9094f858ace4.png.PNG",
    images: [
      "/39e15cc1-5a9e-4e69-851c-9094f858ace4.png.PNG",
      "/38bff081-24c9-4b6e-9e8f-38d6df2e66f2.png.PNG",
      "/_DSF2283.JPG",
      "/_DSF2313.JPG"
    ],
    category: "Jeans",
    description: "Unique double waist design with premium straight fit. Available in 32\" and 36\" waist sizes.",
    size: "36\"",
    availableSizes: ["32\"", "36\""],
    sizeGuide: "Straight Fit",
    inStock: true
  }
];

module.exports = products;

