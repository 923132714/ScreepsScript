/**
 * getAvailableSource 中，建筑存储中能量大于多少才会被当作目标
 */
export const ENERGY_USE_LIMIT = {
  [STRUCTURE_TERMINAL]: 10000,
  [STRUCTURE_STORAGE]: 10000,
  [STRUCTURE_CONTAINER]: 400,
  // 一个 carry 50 容积，至少要保证能有一个 carry 的能量给填充单位用
  [RESOURCE_ENERGY]: 100
};

/**
 * 获取目标中的能量数量，用于抹平差异
 */
export const getEnergyAmount = function (target: EnergyTarget): number {
  if ("store" in target) return target.store[RESOURCE_ENERGY];
  else if ("amount" in target) return target.amount;
  else return 0;
};

/**
 * 获取目标的类型，用于抹平差异
 */
export function getTargetType(target: EnergyTarget): "link" | "container" | "terminal" | "storage" | "energy" {
  if ("structureType" in target) return target.structureType;
  else if ("resourceType" in target) return target.resourceType;
  else return undefined;
}

/**
 * 查找器 - 找到最多的能量来源
 */
export const getMax: EnergyTargetFinder = targets => _.max(targets, getEnergyAmount);

/**
 * 生成查找器 - 找到离目标位置最近的能量来源
 *
 * @param pos 目标位置
 */
export const getClosestTo: (pos: RoomPosition) => EnergyTargetFinder = pos => {
  return targets => pos.findClosestByPath(targets);
};

/**
 * 过滤器 - 优先保证来源中能量大于指定值
 */
export const withLimit: EnergyTargetFilter = targets => {
  return targets.filter(target => getEnergyAmount(target) > ENERGY_USE_LIMIT[getTargetType(target)]);
};

export default { getMax, getClosestTo, withLimit, getEnergyAmount };
