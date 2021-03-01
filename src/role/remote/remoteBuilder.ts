import { bodyConfigs } from "@/setting";
import createBodyGetter from "@/utils/creep/createBodyGetter";
import { getRoomAvailableSource } from "@/modules/energyController/energyController";
import remoteHelperIsNeed from "@/utils/creep/remoteHelperIsNeed";

/**
 * 支援建造者
 * 拓展型建造者, 会先抵达指定房间, 然后执行建造者逻辑
 * 如果都造好的话就升级控制器
 */
export const remoteBuilder: CreepConfig<"remoteBuilder"> = {
  isNeed: (room, preMemory) => {
    const { targetRoomName } = preMemory.data;
    const target = Game.rooms[targetRoomName];
    // 如果房间造好了 terminal，自己的使命就完成了
    return remoteHelperIsNeed(room, target, () => target.terminal && target.terminal.my);
  },
  // 向指定房间移动
  prepare: creep => {
    const { targetRoomName, wayPoint } = creep.memory.data;
    // 设定路径点
    if (wayPoint && !creep.memory.fromShard) {
      creep.setWayPoint(wayPoint);
      creep.memory.fromShard = Game.shard.name as ShardName;
    }

    // 只要进入房间则准备结束
    if (creep.room.name !== targetRoomName) {
      if (wayPoint && creep.memory.fromShard) {
        creep.goTo(undefined, {
          checkTarget: true,
          range: 0
        });
      } else {
        creep.goTo(new RoomPosition(25, 25, targetRoomName));
      }

      return false;
    } else {
      delete creep.memory.moveInfo;
      return true;
    }
  },
  // 下面是正常的建造者逻辑
  source: creep => {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true;

    // 获取有效的能量来源
    let source: AllEnergySource;
    if (!creep.memory.sourceId) {
      source = getRoomAvailableSource(creep.room);
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
    // 有新墙就先刷新墙
    if (creep.memory.fillWallId) creep.steadyWall();
    // 执行建造之后检查下是不是都造好了，如果是的话这辈子就不会再建造了，等下辈子出生后再检查（因为一千多 tick 基本上不会出现新的工地）
    else if (creep.memory.dontBuild) creep.upgrade();
    // 没有就建其他工地
    else if (creep.buildStructure() === ERR_NOT_FOUND) creep.memory.dontBuild = true;

    return creep.store.getUsedCapacity() === 0;
  },
  bodys: createBodyGetter(bodyConfigs.remoteHelper)
};
