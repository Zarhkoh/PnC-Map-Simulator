import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('alliance zone appears after importing JSON', async ({ page }) => {
  const reproJson = {
  "gridSize": 50,
  "keeps": [
    {
      "name": "Mountain",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#323a45",
      "id": "custom-1779749067317"
    },
    {
      "name": "Mountain",
      "power": 0,
      "width": 4,
      "height": 3,
      "color": "#323a45",
      "id": "custom-1779749150973"
    },
    {
      "name": "Zefff",
      "power": 432956400,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-927530b7-ea26-4131-9d96-3fff0160cfd3"
    },
    {
      "name": "KuzeyFirtinasi",
      "power": 418914122,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-508c8ee3-9196-4591-b233-b197c55a69d9"
    },
    {
      "name": "~ChaosQueen~",
      "power": 412114913,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-ead32583-8ef4-411f-af3c-673f6be9cecf"
    },
    {
      "name": "Larskill",
      "power": 406965289,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-582a32d4-d50b-4f62-a92e-665348a60f96"
    },
    {
      "name": "Jamesfx1990-1",
      "power": 369449925,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-fed73917-5309-415c-91df-5bc4ca56d824"
    },
    {
      "name": "Raven29",
      "power": 359111749,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-d1f5bb08-5bdc-4a9e-84f8-0a388c66e020"
    },
    {
      "name": "Darkshadow0614",
      "power": 293124586,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-7e313d42-cd82-4381-8241-a7fffbd0b3bb"
    },
    {
      "name": "Ferocitie",
      "power": 287601187,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-d3b3e951-a361-4484-9583-7116a09d177a"
    },
    {
      "name": "Min-je",
      "power": 281344928,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-8d675769-594a-4de1-b97e-a07793259604"
    },
    {
      "name": "Mortimer",
      "power": 274241200,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-27feefb1-7e02-429b-baf4-80060d726ad0"
    },
    {
      "name": "GodKill",
      "power": 271862971,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-ac4e3ce2-8486-4ee7-a26a-17800aa2a5fc"
    },
    {
      "name": "Hugo-Egon",
      "power": 271612272,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-bd120d25-9bc4-4734-b51c-8c708caaf2de"
    },
    {
      "name": "Sylphrena1",
      "power": 255935341,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-9cbf426d-6944-4edd-8247-7abc18fdaa3b"
    },
    {
      "name": "Valius31",
      "power": 250835806,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-596af118-6e84-493d-916a-be3abe1e782b"
    },
    {
      "name": "Adria49",
      "power": 248854390,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-2a7f2433-8402-4ef5-a2cb-7c0161d4a571"
    },
    {
      "name": "Rakizta",
      "power": 237854342,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-1a61a0f3-ecb5-47a6-b5a9-51063c3d4415"
    },
    {
      "name": "Dhien83",
      "power": 236163175,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-cffe0958-d9a0-49be-b1d6-f2d819e175af"
    },
    {
      "name": "Glaonze",
      "power": 227657434,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-9bad497e-62fa-4dbf-a198-c16716e9c4d2"
    },
    {
      "name": "IGOR1977",
      "power": 227325918,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-b24c20b2-9a52-4ee5-946c-3aaa0510cbc8"
    },
    {
      "name": "Lord-n7",
      "power": 216454386,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-f2df9f0e-3d72-4971-8d43-84fa44709d2e"
    },
    {
      "name": "CharlieSupaSad",
      "power": 214120027,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-a9b286d8-47f8-44b2-a75e-626a46bbfb21"
    },
    {
      "name": "QbbT803",
      "power": 213707940,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-019cf9c9-4f21-4f6e-86f1-8f74d5263a21"
    },
    {
      "name": "Lilly89",
      "power": 210664027,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-6c60bb10-6e03-4ac8-b8b7-9b4fc42632cc"
    },
    {
      "name": "Cornflakes",
      "power": 209690358,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-47d41fef-2d01-419d-8579-09a5ef8819b8"
    },
    {
      "name": "Andarien",
      "power": 204192777,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-148de5cf-546e-44a2-8eaa-a0222fe4f992"
    },
    {
      "name": "Veenm",
      "power": 202438964,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-6411b192-2915-4fb4-af99-0e98179ee332"
    },
    {
      "name": "Relentless",
      "power": 200150388,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-b2ebde97-f80a-4b25-8eaa-391e2fe7f776"
    },
    {
      "name": "Platsch",
      "power": 198564956,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-c8f0efdd-64e3-4120-92f6-7fd8c6087b36"
    },
    {
      "name": "||BoB||",
      "power": 195908874,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-565139c7-518e-4d15-a3c1-f77f2cd1d9b9"
    },
    {
      "name": "Nino2692",
      "power": 189746722,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-f093fb14-e70d-42de-8297-e1507dd680c3"
    },
    {
      "name": "LIGHTx3",
      "power": 188280749,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-32bac4df-f6c5-402b-9d28-c7824b20b745"
    },
    {
      "name": "MadMck92",
      "power": 187936296,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-36128238-b5b9-41fc-b9f8-3c66500ac1ca"
    },
    {
      "name": "Isl8d",
      "power": 186491639,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-dcb00cc1-5e54-41e5-936a-33a10c95e74a"
    },
    {
      "name": "SisterUrsala",
      "power": 184335405,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-b867b745-fbf2-464c-9078-c8392b9327cf"
    },
    {
      "name": "FlyWithAntho",
      "power": 183475946,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-6a2a9f60-cc61-48f9-bad9-5512d31b362b"
    },
    {
      "name": "Moumoul",
      "power": 183260840,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-5c0c4aaf-950c-4561-86f9-de702109129a"
    },
    {
      "name": "Gwen12",
      "power": 180208906,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-6085a2ab-a9b4-4b35-8429-9b9875dea6e8"
    },
    {
      "name": "LadyAngie94",
      "power": 174069569,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-61c60e0d-d986-4911-99b8-c8526d23a252"
    },
    {
      "name": "Bennybangout",
      "power": 173251937,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-066f8b83-7ddb-4153-b866-17b6196ef071"
    },
    {
      "name": "ColinUGress",
      "power": 169949596,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-20a410e9-a768-4476-bd54-75ed15be7f78"
    },
    {
      "name": "Krumeljäger",
      "power": 169719056,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-a1feedd3-4541-49da-b6d4-2242caf8d354"
    },
    {
      "name": "BeefcakePantyhoz",
      "power": 168189215,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-d41da8fd-5256-4f4a-b3da-679f04eb2088"
    },
    {
      "name": "Satyy",
      "power": 161038806,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-1e16a236-4acd-4b9f-8667-441c8204285a"
    },
    {
      "name": "Raikwen",
      "power": 160517689,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-8df03e47-d470-4ead-ab28-aafc4553a862"
    },
    {
      "name": "Jazylove",
      "power": 158939488,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-89925ce1-f9d9-424b-a8dd-45d1a5c99e33"
    },
    {
      "name": "DragonLord68",
      "power": 156521774,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-ae2299b9-b970-4534-958a-1aab55f49d8d"
    },
    {
      "name": "OwlOfTheNight180",
      "power": 156328453,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-cd852842-0eed-45d4-adcc-63d29977bd30"
    },
    {
      "name": "DarkDog73",
      "power": 151695658,
      "width": 2,
      "height": 2,
      "color": "#7ef4c3",
      "id": "custom-bc09aa44-17a4-4222-b3de-ab42b3fd8aaf"
    },
    {
      "name": "ThoRukMaKto",
      "power": 145017001,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-259c13fd-29ba-44c6-abd0-a8f6d5e7cd00"
    },
    {
      "name": "Bigbootylatinas",
      "power": 133465663,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-48dcce8c-8b42-44f0-914d-b3fc47089d55"
    },
    {
      "name": "LatinHeat",
      "power": 133123208,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-4d5fb684-8a64-49b1-af72-e0a68de7a96a"
    },
    {
      "name": "MajorPainPriest",
      "power": 131473382,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-7c43a630-3441-4744-8cd0-90bad5ecad5c"
    },
    {
      "name": "Lilasweather",
      "power": 131264147,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-240d2114-ff22-49ed-a742-c3b9ecef492b"
    },
    {
      "name": "CheekyFox",
      "power": 126962004,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-8c14eadf-0ad4-43bb-bfcb-996fc4e58ca1"
    },
    {
      "name": "Wy0na",
      "power": 123462302,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-ae52c759-5e40-41ef-a9a4-9f595be8ee4c"
    },
    {
      "name": "MorningMassacre",
      "power": 110189178,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-4aae4fe3-5611-46b0-90d7-9dbbe9d5261e"
    },
    {
      "name": "RDRTECH",
      "power": 107635349,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-9edd4e64-f089-4045-af2c-83df1933f443"
    },
    {
      "name": "Ana)(BTS",
      "power": 101023855,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-7f91ddf9-0138-41c0-8c64-82ce923ff654"
    },
    {
      "name": "Jaysaw",
      "power": 100893002,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-d42889a1-40bc-492c-bf7b-402d953bd07c"
    },
    {
      "name": "Badootie",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#3b82f6",
      "id": "custom-ae5eab5e-ae3b-4985-b93a-07035146eea8"
    }
  ],
  "placedBuildings": [
    {
      "id": "alliance-fortress",
      "name": "Alliance Fortress",
      "power": 0,
      "width": 3,
      "height": 3,
      "color": "#64748b",
      "isBase": true,
      "maxCount": 1,
      "x": 26,
      "y": 21
    },
    {
      "id": "infernal-gate",
      "name": "Infernal Gate",
      "power": 0,
      "width": 3,
      "height": 3,
      "color": "#f97316",
      "isBase": true,
      "maxCount": 1,
      "x": 31,
      "y": 23
    },
    {
      "id": "outpost-4",
      "name": "Outpost 5",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#94a3b8",
      "isBase": true,
      "maxCount": 1,
      "x": 33,
      "y": 18
    },
    {
      "id": "outpost-0",
      "name": "Outpost 1",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#94a3b8",
      "isBase": true,
      "maxCount": 1,
      "x": 37,
      "y": 22
    },
    {
      "id": "outpost-1",
      "name": "Outpost 2",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#94a3b8",
      "isBase": true,
      "maxCount": 1,
      "x": 33,
      "y": 28
    },
    {
      "id": "outpost-2",
      "name": "Outpost 3",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#94a3b8",
      "isBase": true,
      "maxCount": 1,
      "x": 30,
      "y": 32
    },
    {
      "id": "alliance-hospital",
      "name": "Alliance Hospital",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#64748b",
      "isBase": true,
      "maxCount": 1,
      "x": 26,
      "y": 30
    },
    {
      "id": "outpost-3",
      "name": "Outpost 4",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#94a3b8",
      "isBase": true,
      "maxCount": 1,
      "x": 23,
      "y": 28
    },
    {
      "id": "alliance-resource",
      "name": "Alliance Resource",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#64748b",
      "isBase": true,
      "maxCount": 1,
      "x": 38,
      "y": 26
    },
    {
      "id": "alliance-warehouse",
      "name": "Alliance Warehouse",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#64748b",
      "isBase": true,
      "maxCount": 1,
      "x": 24,
      "y": 15
    },
    {
      "name": "Mountain",
      "power": 0,
      "width": 2,
      "height": 2,
      "color": "#323a45",
      "id": "custom-1779749067317",
      "x": 25,
      "y": 27
    },
    {
      "name": "Mountain",
      "power": 0,
      "width": 4,
      "height": 3,
      "color": "#323a45",
      "id": "custom-1779749150973",
      "x": 21,
      "y": 24
    }
  ]
};

  const filePath = path.join(__dirname, 'repro.json');
  fs.writeFileSync(filePath, JSON.stringify(reproJson));

  await page.goto('http://localhost:5173');

  // Trigger import
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // Wait a bit for the import to process and state to update
  await page.waitForTimeout(1000);

  // Check if alliance zone (polygons) exists in the SVG
  const alliancePolygons = page.locator('svg polygon[fill="rgba(34, 197, 94, 0.15)"]');

  const count = await alliancePolygons.count();
  console.log('Alliance polygons count:', count);

  expect(count).toBeGreaterThan(0);

  // Clean up
  fs.unlinkSync(filePath);
});
