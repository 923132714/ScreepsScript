import { runRCLTest } from "../utils/runRCLTest";
const TICK_NUM = 25000;
const RCL = 4;

describe(`测试 RCL${RCL} -> RCL${RCL + 1}`, () => {
  it(`测试 RCL${RCL} -> RCL${RCL + 1}`, async () => {
    await runRCLTest(RCL, RCL + 1, TICK_NUM);
  });
});
