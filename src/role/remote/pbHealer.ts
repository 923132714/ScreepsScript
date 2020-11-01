import calcBodyPart from "utils/calcBodyPart";

/**
 * PowerBank 治疗单位
 * 移动并治疗 pbAttacker, 请在 8 级时生成
 */
export default (data: HealUnitData): ICreepConfig => ({
  target: creep => {
    const targetCreep = Game.creeps[data.creepName];
    // 对象没了就殉情
    if (!targetCreep) {
      creep.suicide();
      return false;
    }

    // 移动到身边了就治疗
    if (creep.pos.isNearTo(targetCreep)) creep.heal(targetCreep);
    else creep.goTo(targetCreep.pos);
    return false;
  },
  bodys: () => calcBodyPart({ [HEAL]: 25, [MOVE]: 25 })
});
