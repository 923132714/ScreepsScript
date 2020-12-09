import colorful from "utils/console/colorful";
import creepWorks from "role";

/**
 * creep 发布 api
 * 所有 creep 的增删改查都由该模块封装
 */
export const creepApi = {
  /**
   * 新增 creep
   * 该方法会自动给对应的房间推送 creep 孵化任务
   *
   * @param creepName 新增的 creep 名称，如果已存在则会覆盖其配置
   * @param role creep 的角色名称
   * @param data creep 的配置项
   * @param spawnRoom 要孵化到的房间
   * @returns ERR_NOT_FOUND 未找到对应的 creepWork
   * @returns ERR_NOT_OWNER 孵化房间不是自己的或者无法进行孵化
   */
  add(
    creepName: string,
    role: CreepRoleConstant,
    data: CreepData,
    spawnRoom: string
  ): OK | ERR_NOT_FOUND | ERR_NOT_OWNER {
    if (!Memory.creepConfigs) Memory.creepConfigs = {};
    if (!creepWorks[role]) return ERR_NOT_FOUND;

    // 不管有没有直接覆盖掉
    Memory.creepConfigs[creepName] = { role, data, spawnRoom };
    // 如果已经存在的话就不推送孵化任务了
    if (creepName in Game.creeps) return OK;

    // 检测目标房间是否可以进行孵化
    const room = Game.rooms[spawnRoom];
    if (!room) return ERR_NOT_OWNER;
    // 推送孵化任务
    room.addSpawnTask(creepName);
    return OK;
  },

  /**
   * 查询指定 creep 是否存在配置项
   *
   * @param creepName 要查询的 creep 名称
   */
  has(creepName: string): boolean {
    return creepName in Memory.creepConfigs;
  },

  /**
   * 移除指定 creep 配置项
   * 该方法不会直接杀死对应的 creep。在该 creep 老死后才会因为 找不到配置项而不再继续孵化
   *
   * @param creepName 要移除的 creep 名称
   * @returns ERR_NOT_FOUND 未找到该 creep
   */
  remove(creepName: string): OK | ERR_NOT_FOUND {
    if (!Memory.creepConfigs || !(creepName in Memory.creepConfigs)) return ERR_NOT_FOUND;

    delete Memory.creepConfigs[creepName];
    return OK;
  },

  /**
   * 危险操作 - 批量移除 creep 及其配置项
   *
   * @param creepNamePart creep 名称关键字
   */
  batchRemove(creepNamePart: string): OK | ERR_INVALID_ARGS {
    if (!creepNamePart) return ERR_INVALID_ARGS;

    Object.keys(Memory.creepConfigs).map(configName => {
      if (configName.includes(creepNamePart)) {
        delete Memory.creepConfigs[configName];
        if (Game.creeps[configName]) Game.creeps[configName].suicide();
      }
    });

    return OK;
  },

  /**
   * 修改配置
   * 修改 creep 的局部配置
   *
   * @param creepName 要修改配置的 creep 名称
   * @param data 要进行修改的配置
   */
  edit(creepName: string, data: CreepData): OK | ERR_NOT_FOUND {
    if (!Memory.creepConfigs || !(creepName in Memory.creepConfigs)) return ERR_NOT_FOUND;

    Memory.creepConfigs[creepName].data = _.assign(Memory.creepConfigs[creepName].data, data);
    return OK;
  },

  /**
   * 格式化输出所有 creep 配置
   */
  show(): string {
    if (!Memory.creepConfigs) return `暂无 creep 配置`;
    // 将 creep 的配置进行格式化
    const format: { [roomName: string]: string[] } = {};
    // 遍历所有配置项并格式化
    for (const creepName in Memory.creepConfigs) {
      const creepConfig = Memory.creepConfigs[creepName];
      // 兜底
      if (!(creepConfig.spawnRoom in format)) format[creepConfig.spawnRoom] = [`${creepConfig.spawnRoom} 下属 creep：`];

      // 检查该单位的存活状态
      const creep = Game.creeps[creepName];
      let liveStats = "";
      if (creep) {
        if (creep.spawning) liveStats = colorful("孵化中", "yellow");
        else liveStats = `${colorful("存活", "green")} 剩余生命 ${Game.creeps[creepName].ticksToLive}`;
      } else liveStats = colorful("未孵化", "red");

      format[creepConfig.spawnRoom].push(`  - [${creepName}] [角色] ${creepConfig.role} [当前状态] ${liveStats}`);
    }

    const logs = [];
    Object.values(format).forEach(roomCreeps => logs.push(...roomCreeps));
    logs.unshift(`当前共有 creep 配置 ${Object.keys(Memory.creepConfigs).length} 项`);
    return logs.join("\n");
  }
};
