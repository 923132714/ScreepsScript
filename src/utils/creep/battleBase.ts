/**
 * 战斗 creep 基础阶段
 * 本方法抽象出了战斗 Creep 通用的 source 阶段和 switch 阶段
 */
export const battleBase = <Role extends CreepRoleConstant>(): ICreepStage<Role> => ({
  // 根据玩家配置决定是否持续生成
  isNeed: (room, preMemory) => (preMemory.data as WarUnitData).keepSpawn,
  /**
   * 获取旗帜，然后向指定房间移动
   * 同时保证自己的健康状态
   */
  source: creep => {
    const { targetFlagName } = creep.memory.data as WarUnitData;

    const targetFlag = creep.getFlag(targetFlagName);
    if (!targetFlag) {
      creep.say("旗呢?");
      return false;
    }

    // 远程移动
    creep.goTo(targetFlag.pos);
    creep.say("🛴", true);

    if (creep.pos.roomName === targetFlag.pos.roomName) {
      creep.log(`抵达指定房间，切入作战模式`, "green");
      return true;
    }

    // 保证自己血量健康（兼容没有 HEAL 的 creep）
    if (creep.hits < creep.hitsMax && creep.getActiveBodyparts(HEAL)) {
      creep.heal(creep);
      creep.say("💔", true);
    }

    return false;
  }
});
