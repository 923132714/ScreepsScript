import { bodyConfigs } from "@/setting";
import createBodyGetter from "@/utils/creep/createBodyGetter";
import { getRoomEnergyTarget } from "@/modules/energyController";

/**
 * 协助建造者
 * 协助其他玩家进行建造工作
 */
export const buildHelper: CreepConfig<"buildHelper"> = {
  // 下面是正常的建造者逻辑
  source: creep => {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      const { targetRoomName } = creep.memory.data;
      if (creep.room.name !== targetRoomName) {
        creep.goTo(new RoomPosition(25, 25, targetRoomName));
        return false;
      } else {
        creep.goTo(new RoomPosition(25, 25, targetRoomName));
        delete creep.memory.moveInfo;
        return true;
      }
    }
    // 获取有效的能量来源
    let source: AllEnergySource;
    if (!creep.memory.sourceId) {
      source = source = getRoomEnergyTarget(creep.room);
      if (!source) {
        creep.say("没能量了，歇会");
        return false;
      }

      creep.memory.sourceId = source.id;
    } else source = Game.getObjectById(creep.memory.sourceId);
    // 之前的来源建筑里能量不够了就更新来源
    if (
      !source ||
      (source instanceof Structure && source.store[RESOURCE_ENERGY] < 300) ||
      (source instanceof Source && source.energy === 0) ||
      (source instanceof Ruin && source.store[RESOURCE_ENERGY] === 0)
    )
      delete creep.memory.sourceId;

    creep.getEngryFrom(source);
    return false;
  },
  target: creep => {
    const { targetRoomName } = creep.memory.data;
    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 0 || creep.room.name !== targetRoomName) return true;

    // 检查脚下的路有没有问题，有的话就进行维修
    const structures = creep.pos.lookFor(LOOK_STRUCTURES);

    if (structures.length > 0) {
      const road = structures[0];
      if (road.hits < road.hitsMax) creep.repair(road);
    }

    if (creep.memory.fillWallId)
      // 有新墙就先刷新墙
      creep.steadyWall();
    // 执行建造之后检查下是不是都造好了，如果是的话这辈子就不会再建造了，等下辈子出生后再检查（因为一千多 tick 基本上不会出现新的工地）
    else if (creep.memory.dontBuild) creep.upgrade();
    // 没有就建其他工地
    else if (creep.buildStructure() === ERR_NOT_FOUND) creep.memory.dontBuild = true;

    return creep.store.getUsedCapacity() === 0;
  },
  bodys: createBodyGetter(bodyConfigs.remoteHelper)
};
