import colorful, { colors } from "../../../../src/utils/console/colorful";
import { assert } from "chai";

describe("colorful", () => {
  it("可以添加颜色", () => {
    const colorNames = ["green", "blue", "yellow", "red"] as Colors[];
    colorNames.forEach(colorName =>
      assert.equal(colorful("TestString", colorName), `<text style="color: ${colors[colorName]}; ">TestString</text>`)
    );
  });

  it("可以加粗", () => {
    assert.equal(colorful("TestString", null, true), `<text style=" font-weight: bolder;">TestString</text>`);
  });

  it("可以添加颜色同时加粗", () => {
    const colorNames = ["green", "blue", "yellow", "red"] as Colors[];
    colorNames.forEach(colorName =>
      assert.equal(
        colorful("TestString", colorName, true),
        `<text style="color: ${colors[colorName]}; font-weight: bolder;">TestString</text>`
      )
    );
  });

  it("参数仅有 content 时", () => {
    assert.equal(colorful("TestString"), `<text style=" ">TestString</text>`);
  });
});