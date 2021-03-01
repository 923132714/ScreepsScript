import { addDelayCallback, addDelayTask } from "@/modules/delayQueue";
import { bodyConfigs } from "@/setting";
import createBodyGetter from "@/utils/creep/createBodyGetter";

/**
 * 刷墙者
 * 从指定结构中获取能量 > 维修房间内的墙壁
 *
 * 在低等级时从 container 中拿能量刷墙
 * 在敌人进攻时孵化并针对性刷墙
 * 8 级之后每 5000t 孵化一次进行刷墙
 */
export const repairer: CreepConfig<"repairer"> = {
  // 根据敌人威胁决定是否继续生成
  isNeed: (room, preMemory) => {
    // cpu 快吃完了就不孵化
    if (Game.cpu.bucket < 700) {
      addSpawnRepairerTask(room.name);
      return false;
    }

    // 房间里有威胁就孵化
    if (room.controller.checkEnemyThreat()) return true;

    // RCL 到 7 就不孵化了，因为要拿能量去升级（到 8 时会有其他模块重新发布 repairer）
    if (room.controller.level === 7) return false;
    // RCL 8 之后 1000 tick 孵化一次
    else if (room.controller.level >= 8) {
      addSpawnRepairerTask(room.name);
      return false;
    }

    // 如果能量来源没了就重新规划
    if (!Game.getObjectById(preMemory.data.sourceId)) {
      room.releaseCreep("repairer");
      return false;
    }

    return true;
  },
  source: creep => {
    const { sourceId } = creep.memory.data;
    const source = Game.getObjectById(sourceId) || creep.room.storage || creep.room.terminal;

    // 能量不足就先等待，优先满足 manager 需求
    if (source.store[RESOURCE_ENERGY] < 500) {
      creep.say("🎮");
      return false;
    }
    creep.getEngryFrom(source);

    return creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
  },
  // 一直修墙就完事了
  target: creep => {
    let importantWall = creep.room.importantWall;
    // 先尝试获取焦点墙，有最新的就更新缓存，没有就用缓存中的墙
    if (importantWall) creep.memory.fillWallId = importantWall.id;
    else if (creep.memory.fillWallId) importantWall = Game.getObjectById(creep.memory.fillWallId);

    // 有焦点墙就优先刷
    if (importantWall) {
      const actionResult = creep.repair(creep.room.importantWall);
      if (actionResult === OK) {
        // 离墙三格远可能正好把路堵上，所以要走进一点
        if (!creep.room.importantWall.pos.inRangeTo(creep.pos, 2)) creep.goTo(creep.room.importantWall.pos);
      } else if (actionResult === ERR_NOT_IN_RANGE) creep.goTo(creep.room.importantWall.pos);
    }
    // 否则就按原计划维修
    else creep.fillDefenseStructure();

    return creep.store.getUsedCapacity() === 0;
  },
  bodys: createBodyGetter(bodyConfigs.worker)
};

/**
 * 给指定房间添加 repairer 的延迟孵化任务
 *
 * @param roomName 添加到的房间名
 */
function addSpawnRepairerTask(roomName: string): void {
  addDelayTask("spawnRepairer", { roomName }, Game.time + 1000);
}

/**
 * 注册 repairer 的延迟孵化任务
 */
addDelayCallback("spawnRepairer", room => {
  // cpu 还是不够的话就延迟发布
  if (Game.cpu.bucket < 700) return addSpawnRepairerTask(room.name);
  if (room) room.releaseCreep("repairer");
});
