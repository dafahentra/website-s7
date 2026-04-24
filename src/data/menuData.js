// src/data/menuData.js
// Mapping: id lokal → item Moka via `mokaGuid` (permanen).
// GUID diambil dari: GET /v1/outlets/{outlet_id}/items → field `guid`
// GUID tidak berubah walau nama/harga/kategori di Moka diedit.

import Usutcha from "../assets/Usutcha.png";
import Sectorize from "../assets/Sectorize.png";
import MatchaLatte from "../assets/MatchaLatte.png";
import MatchaStraw from "../assets/MatchaStraw.png";
import DirtyMatcha from "../assets/DirtyMatcha.png";
import SeaSalt from "../assets/SeaSalt.png";
import Americano from "../assets/Americano.png";
import Cappucino from "../assets/Cappucino.png";
import Latte from "../assets/Latte.png";
import Abericano from "../assets/Abericano.png";
import Vanilla from "../assets/Vanilla.png";
import Hazelnuts from "../assets/Hazelnuts.png";
import Butterscotch from "../assets/Butterscotch.png";
import Wizzie from "../assets/Wizzie.png";
import Palm from "../assets/Palm.png";
import Caramelted from "../assets/Caramelted.png";
import Choco from "../assets/Choco.png";
import Reveluv from "../assets/Reveluv.png";
import Kwasong from "../assets/Kwasong.png";
import Cinnamon from "../assets/Cinnamon.png";
import Apple from "../assets/Apple.png";
import Plain from "../assets/Plain.png";
import Double from "../assets/Double.png";
import Blueberry from "../assets/Blueberry.png";

export const menuItems = {
  "Espresso Based": [
    {
      id: 2,
      mokaGuid: "28ec1798-40d3-4600-adb5-8bbdeab195b5",
      name: "Americano",
      description: "An Americano, rich espresso shots. Bold and robust cup",
      price: "19.000",
      image: Americano,
    },
    {
      id: 3,
      mokaGuid: "408f496d-f130-4f4c-a31d-f752c0cfbe05",
      name: "Abericano",
      description:
        "An Americano mixed with strawberry jam. A vibrant and fruity twist on a classic",
      price: "23.000",
      image: Abericano,
    },
    {
      id: 4,
      mokaGuid: "62e16b35-dd2d-45d3-9ad5-15ea20258b38",
      name: "Latte",
      description:
        "Our espresso flows through a channel of perfectly steamed milk",
      price: "23.000",
      image: Latte,
    },
    {
      id: 5,
      mokaGuid: "52088bc0-87b0-48dc-8492-5b50ddcbb132",
      name: "Cappucino",
      description:
        "Balanced engine of espresso, steamed milk, and a dense cap of velvety foam",
      price: "23.000",
      image: Cappucino,
    },
  ],

  "Flavoured Lattes": [
    {
      id: 1,
      mokaGuid: "31f56e89-85b6-44d9-a85f-c72cc4043b01",
      name: "Sectorize",
      description: "Bold espresso with creamy milk and subtle sweetness",
      price: "23.000",
      image: Sectorize,
    },
    {
      id: 6,
      mokaGuid: "27ff3fc5-858c-4b41-a1c8-4b4aabd2b386",
      name: "White Vanilla",
      description:
        "The original Vanilla Latte, rich espresso, steamed milk, and timeless vanillla",
      price: "25.000",
      image: Vanilla,
    },
    {
      id: 7,
      mokaGuid: "a5114b75-05f9-4564-bd94-ed735738d71c",
      name: "Buttery",
      description:
        "A warm Butterscotch Latte, blend of rich espresso and buttery, melted butterscotch",
      price: "25.000",
      image: Butterscotch,
    },
    {
      id: 8,
      mokaGuid: "a0fabb88-14a6-4469-b797-4ac7461907b2",
      name: "Hazelnutz",
      description:
        "A perfect Hazelnut Latte, bold espresso, creamy milk, and roasted hazelnut",
      price: "25.000",
      image: Hazelnuts,
    },
    {
      id: 9,
      mokaGuid: "2a5aa009-ee68-4a1c-907c-5d78e97b30ed",
      name: "Palmer",
      description:
        "A beauty of Palm Sugar, steamed milk, and marked with espresso",
      price: "25.000",
      image: Palm,
    },
    {
      id: 10,
      mokaGuid: "8368c69c-0090-49c6-90a0-0ffb4553080c",
      name: "Caramelted",
      description:
        "A suspended balance of sweet, Salted Caramel Latte, and a sharp sea salt, all unified with smooth espresso",
      price: "25.000",
      image: Caramelted,
    },
  ],

  "Matcha Series": [
    {
      id: 11,
      mokaGuid: "20b6ca0c-af1f-41ee-bcea-d78b9aeb7024",
      name: "Pure Matcha",
      description: "A clean charge of pure matcha with a soft, rounded finish",
      price: "23.000",
      image: Usutcha,
    },
    {
      id: 12,
      mokaGuid: "6aa3e836-120f-46ed-8a69-9bf10832965b",
      name: "Green Flag",
      description:
        "Vibrant matcha latte with pure matcha suspended in creamy milk",
      price: "27.000",
      image: MatchaLatte,
    },
    {
      id: 13,
      mokaGuid: "bd157b20-693f-4379-ade9-8c5960913ae2",
      name: "Red Flag",
      description:
        "Sweet Strawberry purée rises to meet a creamy, earthy float of ceremonial matcha",
      price: "27.000",
      image: MatchaStraw,
    },
    {
      id: 14,
      mokaGuid: "623e393a-ad15-4828-9d77-dbd0394b3c17",
      name: "Dirty Matcha",
      description:
        "A powerful, gritty fusion of Dirty Matcha and a shot of our signature espresso",
      price: "27.000",
      image: DirtyMatcha,
    },
    {
      id: 15,
      mokaGuid: "b2ff63f6-8d5e-489a-acca-681f0d1130e7",
      name: "Sea Salt Matcha",
      description:
        "Pure matcha and milk, finished with a savory salted cream foam",
      price: "27.000",
      image: SeaSalt,
    },
  ],

  "Milk Series": [
    {
      id: 16,
      mokaGuid: "82a18590-7167-465b-a9fd-8601deaf92fb",
      name: "Chocolate",
      description: "A deep and decadent cup of chocolate and milk",
      price: "25.000",
      image: Choco,
    },
    {
      id: 17,
      mokaGuid: "801f7781-b316-48f0-b961-4c4f7c4105fa",
      name: "Red Velvet",
      description: "Crimson-hued red velvet, bold by design",
      price: "25.000",
      image: Reveluv,
    },
    {
      id: 18,
      mokaGuid: "85c419a7-ade6-4b48-8db2-78dca26cdf07",
      name: "Wizzie Berry",
      description:
        "Milk and strawberry syrup blended into a strawberry milkshake",
      price: "25.000",
      image: Wizzie,
    },
  ],

  "Pastry": [
    {
      id: 19,
      mokaGuid: "d97c19d5-b3d6-4107-bf67-922e3f7519a7",
      name: "Croissant Almond",
      description: "Flaky croissant filled with almond cream",
      price: "22.000",
      image: Kwasong,
    },
    {
      id: 20,
      mokaGuid: "785856cc-230f-4ff2-bc05-5abd70e56f28",
      name: "Cinnamon Roll",
      description: "Soft roll swirled with cinnamon sugar",
      price: "20.000",
      image: Cinnamon,
    },
    {
      id: 21,
      mokaGuid: "246515e1-8af5-4fed-8c46-40187ff26f2b",
      name: "Apple Danish",
      description: "Buttery danish with apple filling",
      price: "20.000",
      image: Apple,
    },
    {
      id: 22,
      mokaGuid: "d89efa44-967c-4af7-bf92-36fe81d629e6",
      name: "Plain",
      description: "Simple, buttery pastry",
      price: "15.000",
      image: Plain,
    },
    {
      id: 23,
      mokaGuid: "94a783d9-de3f-4979-a8b9-8b40796c06e5",
      name: "Double Choco",
      description: "Double chocolate pastry",
      price: "20.000",
      image: Double,
    },
    {
      id: 24,
      mokaGuid: "a47b05ae-107d-4558-b0a2-489e1498285d",
      name: "Blueberry Cream Cheese",
      description: "Blueberry pastry with cream cheese",
      price: "22.000",
      image: Blueberry,
    },
  ],
};