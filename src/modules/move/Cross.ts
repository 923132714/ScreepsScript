import crossRules from "./crossRules";

export class Cross {
  /**
   * 向指定方向发起对穿
   *
   * @param creep 发起对穿的 creep
   * @param direction 要进行对穿的方向
   * @param fontCreep 要被对穿的 creep
   *
   * @returns OK 成功对穿
   * @returns ERR_BUSY 对方拒绝对穿
   * @returns ERR_INVALID_TARGET 前方没有 creep
   */
  public static mutualCross(
    creep: Creep | PowerCreep,
    direction: DirectionConstant,
    fontCreep: Creep | PowerCreep
  ): OK | ERR_BUSY | ERR_INVALID_TARGET {
    creep.say(`👉`);

    // 如果前面的 creep 同意对穿了，自己就朝前移动
    const reverseDirection = this.getOppositeDirection(direction);
    const fontMoveResult = this.requireCross(fontCreep, reverseDirection, creep);
    if (fontMoveResult !== OK) {
      creep.say(`👉 ${fontMoveResult}`);
      // 如果前面的 creep 拒绝了，就重新寻路
      if (fontMoveResult === ERR_BUSY) {
        delete creep.memory.moveInfo.path;
      }
      return ERR_BUSY;
    }
    const selfMoveResult = creep.move(direction);
    return selfMoveResult === OK && fontMoveResult === OK ? OK : ERR_BUSY;
  }

  /**
   * 请求对穿
   * 自己内存中 stand 为 true 时将拒绝对穿
   *
   * @param creep 被请求对穿的 creep
   * @param direction 请求该 creep 进行对穿
   * @param requireCreep 发起请求的 creep
   */
  private static requireCross(
    creep: Creep | PowerCreep,
    direction: DirectionConstant,
    requireCreep: Creep | PowerCreep
  ): ScreepsReturnCode {
    // creep 下没有 memory 说明 creep 已经凉了，直接移动即可
    if (!creep.memory) return OK;

    // 获取对穿规则并进行判断
    const allowCross = crossRules[creep.memory.role] || crossRules.default;
    if (!allowCross(creep, requireCreep)) {
      creep.say("👊");
      return ERR_BUSY;
    } else {
      // 同意对穿
      creep.say("👌");
      const moveResult = creep.move(direction);
      if (moveResult === OK && creep.memory.moveInfo?.path?.length > 0  ) {
        // 记录对穿creepName 用于避免原地重复对穿
        creep.memory.moveInfo.LastCross = requireCreep.name;
        // 如果移动的方向不是路径中的方向的话，就重新寻路
        if ((Number(creep.memory.moveInfo.path[0]) as DirectionConstant) !== direction) {
          delete creep.memory.moveInfo.path;
        }
      }
      return moveResult;
    }
  }

  /**
   * 获取指定方向的相反方向
   *
   * @param direction 目标方向
   */
  private static getOppositeDirection(direction: DirectionConstant): DirectionConstant {
    return (((direction + 3) % 8) + 1) as DirectionConstant;
  }
}
