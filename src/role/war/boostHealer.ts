import { boostPrepare } from "utils/creep/boostPrepare";
import calcBodyPart from "utils/creep/calcBodyPart";

/**
 * 强化 - HEAL
 * 7 级以上可用, 25HEAL 25MOVE
 */
export default function boostHealer(data: HealUnitData): ICreepConfig {
  return {
    isNeed: () => data.keepSpawn,
    prepare: creep => {
      // 治疗单位不允许发起对穿
      if (!creep.memory.disableCross) creep.memory.disableCross = true;

      return boostPrepare().prepare(creep);
    },
    target: creep => {
      const target = Game.creeps[data.creepName];
      if (!target) {
        creep.say("💤");
        return false;
      }
      creep.healTo(target);
      return false;
    },
    bodys: () => calcBodyPart({ [TOUGH]: 12, [HEAL]: 25, [MOVE]: 10 })
  };
}
