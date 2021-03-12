/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IntegrationTestHelper } from "../helper";
const { TerrainMatrix } = require("screeps-server-mockup");
const { readFileSync } = require("fs");

const DIST_MAIN_JS = "dist/main.js";
const DIST_MAIN_JS_MAP = "dist/main.js.map.js";

export async function initRCLTestRoom(helper: IntegrationTestHelper, RCL: number): Promise<void> {
  const { db } = helper.server.common.storage;
  const C = helper.server.constants;
  const terrain = new TerrainMatrix();
  const walls = [
    [10, 10],
    [10, 40],
    [40, 10],
    [40, 40]
  ];
  _.each(walls, ([x, y]) => terrain.set(x, y, "wall"));

  await helper.server.world.addRoom("W0N0");
  await helper.server.world.setTerrain("W0N0", terrain);
  const controller = await helper.server.world.addRoomObject("W0N0", "controller", 10, 10, { level: 1 });
  await helper.server.world.addRoomObject("W0N0", "source", 10, 40, {
    energy: C.SOURCE_ENERGY_CAPACITY,
    energyCapacity: C.SOURCE_ENERGY_CAPACITY,
    ticksToRegeneration: 300
  });
  await helper.server.world.addRoomObject("W0N0", "source", 40, 10, {
    energy: C.SOURCE_ENERGY_CAPACITY,
    energyCapacity: C.SOURCE_ENERGY_CAPACITY,
    ticksToRegeneration: 300
  });
  await helper.server.world.addRoomObject("W0N0", "mineral", 40, 40, {
    mineralType: "X",
    density: 3,
    mineralAmount: C.MINERAL_DENSITY[3]
  });

  const modules = {
    main: readFileSync(DIST_MAIN_JS).toString(),
    "main.js.map": readFileSync(DIST_MAIN_JS_MAP).toString()
  };
  helper.user = await helper.server.world.addBot({ username: "tester", room: "W0N0", x: 21, y: 26, modules });

  const rclProgressPercent = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 90, 7: 90 };
  await db["rooms.objects"].update(
    { _id: controller._id },
    { $set: { level: RCL, progress: (C.CONTROLLER_LEVELS[RCL] / 100) * rclProgressPercent[RCL] } }
  );
}
